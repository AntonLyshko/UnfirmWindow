import React, { useState, Fragment, useRef, useEffect } from "react";
import "./Chat.scss";
import { DownOutlined } from "@ant-design/icons";
import _ from "lodash";
import { inject, observer } from "mobx-react";
import IStores, { IChatStore, IContactStore, IUserStore } from "@stores/interface";
import { firechat } from "@stores/implementation/Firebase/firebase";
// import { useWhyDidYouUpdate } from "@hooks";
import Inputer from "./comp/Inputer";
import ChatPlaceholder from "./comp/ChatPlaceholder";
import Chat from "./Chat";

// import { Menu, Dropdown, Divider } from "antd";
// import SmileMenu from './comp/SmileMenu'
// import PuffLoader from "react-spinners/PuffLoader";

type IProps = {
  chatStore?: IChatStore;
  contactStore?: IContactStore;
  userStore?: IUserStore;
};

const ChatWrapper = inject((stores: IStores) => ({
  chatStore: stores.chatStore,
  contactStore: stores.contactStore,
  userStore: stores.userStore,
}))(
  observer((props: IProps) => {
    const { chatStore } = props;
    const [isOpenMenu, setIsOpenMnu] = useState(false);
    // const [switcher, setSwitcher] = useState("");

    // Firebase news
    // const [actionStatus, setActionStatus] = useState("");

    const scrollBottomTrigger = chatStore.scrollBottomTrigger;
    const initialScroll = chatStore.initialScroll;

    const isBottom = chatStore.isBottom;
    const isBottomZone = chatStore.isBottomZone;

    const lastSeenMessage = chatStore.lastSeenMessage;

    const currentChat = chatStore.activeChat;
    const fireMessages = chatStore.fireMessages ? chatStore.fireMessages : [];

    //
    const [triggeredMoment, setTriggeredMoment] = useState({});

    const msgSpace = useRef(null);

    const [chatListRef, setChatRef] = useState(null);

    // useWhyDidYouUpdate("Chat", {
    //   scrollBottomTrigger,
    //   currentChat,
    //   initialScroll,
    //   isBottom,
    //   isBottomZone,
    //   triggeredMoment,
    //   lastSeenMessage,
    //   setChatRef,
    // });

    // let last_date: any = null;

    useEffect(() => {
      firechat
        .messages(currentChat ? currentChat.id : null)
        .limitToLast(25)
        .on("value", (snapshot: any) => {
          chatStore.updateFireMessages(snapshot.val());
        });
    }, [currentChat]);

    useEffect(() => {
      if (chatStore.isLoadingPrev) {
        let scrollTo = fireMessages.length - triggeredMoment["messageCount"] + triggeredMoment["messageIndex"];
        chatListRef.scrollToItem(scrollTo, "start");
        setTimeout(() => chatStore.setLoadingPrev(false), 500);
      }
    }, [fireMessages]);

    useEffect(() => {
      if (chatStore.newMessageCount > 0) {
        chatStore.readAllMessages();
        chatStore.setNewMessageCount(0);
      }
    }, [isBottomZone]);

    //? newMessageCount & unreadDivider

    useEffect(() => {
      let timer = setTimeout(() => {
        if (isBottomZone && lastSeenMessage) {
          let lastSeenMessageCopy = lastSeenMessage;
          chatStore.setLastSeenMessage(null);
          updateListLayout(lastSeenMessageCopy);
        }
      }, 12000);
      return () => clearTimeout(timer);
    }, [isBottomZone]);

    useEffect(() => {
      if (lastSeenMessage) updateListLayout(lastSeenMessage);
    }, [lastSeenMessage]);

    const updateListLayout = (message: any) => {
      let messageIndex = fireMessages.findIndex((m) => m.id === message.id);
      chatListRef.resetAfterIndex(messageIndex);
    };

    //? loading prev action

    const increaseLimit = _.debounce(
      async (visiableTop) => {
        if (!chatStore.isLoadingPrev) {
          setTriggeredMoment({
            messageIndex: visiableTop,
            messageCount: fireMessages.length,
          });
          chatStore.setLoadingPrev(true);
          await chatStore.loadPrevMessages();
        }
      },
      3550,
      { leading: true, trailing: false }
    );

    // ? scrollBottom Action

    useEffect(() => {
      if (initialScroll && chatListRef) scrollBottom();
    }, [chatListRef]);

    const scrollBottom = _.debounce(
      async () => {
        if (chatListRef && fireMessages.length) {
          chatListRef.scrollToItem(9999, "auto");
          if (scrollBottomTrigger) chatStore.setScrollBottomTrigger(false);
          chatStore.setNewMessageCount(0);
        }
      },
      1350,
      { leading: true, trailing: false }
    );

    const setInitialScroll = (value: boolean) => {
      chatStore.setInitialScroll(value);
    };

    const setIsBottom = (value: boolean) => {
      chatStore.setIsBottom(value);
    };

    const setIsBottomZone = (value: boolean) => {
      chatStore.setIsBottomZone(value);
    };

    const setNewMessageCount = (value: number) => {
      chatStore.setNewMessageCount(value);
    };

    const openHelperMenu = () => setIsOpenMnu(!isOpenMenu);

    return (
      <div className='chat position-relative'>
        <div ref={msgSpace} className='msg_space' id={!!currentChat && currentChat.id + "_msg_space"}>
          {currentChat && fireMessages.length ? (
            <>
              <Fragment>
                <Chat
                  msgSpace={msgSpace}
                  isBottomZone={isBottomZone}
                  setIsBottomZone={setIsBottomZone}
                  isBottom={isBottom}
                  setIsBottom={setIsBottom}
                  increaseLimit={increaseLimit}
                  chatListRef={chatListRef}
                  setChatRef={setChatRef}
                  fireMessages={fireMessages}
                  scrollBottom={scrollBottom}
                  initialScroll={initialScroll}
                  setInitialScroll={setInitialScroll}
                  scrollBottomTrigger={scrollBottomTrigger}
                  lastSeenMessage={lastSeenMessage}
                  newMessageCount={chatStore.newMessageCount}
                  setNewMessageCount={setNewMessageCount}
                />
              </Fragment>
            </>
          ) : (
            <ChatPlaceholder />
          )}
        </div>

        {!isBottomZone && fireMessages.length ? (
          <div className='scroll-to-bottom' onClick={() => scrollBottom()}>
            {chatStore.newMessageCount > 0 ? (
              <div className='new-messages-indicator'>{chatStore.newMessageCount}</div>
            ) : null}
            <DownOutlined />
          </div>
        ) : null}

        {currentChat && <Inputer helperMenu={openHelperMenu} />}
      </div>
    );
  })
);

export default ChatWrapper;

// const handleWheel = () => {
//   let scrollTop = msgSpace.current.scrollTop;
//   if (scrollTop < 500 && fireMessages && fireMessages.length > 23 && chatStore.haveNext) {
//     increaseLimit();
//   }
// };

// const handleTouchEnd = () => setActionStatus("TouchEnd");

// const handleTouchStart = () => setActionStatus("TouchStart");

// const handleScroll = () => {
//   let scrollTop = msgSpace.current.scrollTop;
//   let clientHeight = msgSpace.current.clientHeight;
//   let scrollHeight = msgSpace.current.scrollHeight;
//   let offSetFromBottom = scrollHeight - scrollTop - clientHeight;
//   // Pagination
//   if (scrollTop < 350 && actionStatus === "TouchEnd" && !initialScroll) increaseLimit();

//   // isBottom or not
//   if (offSetFromBottom > 100 && isBottom && fireMessages.length > 10) setIsBottom(false);
//   if (Math.ceil(scrollTop + clientHeight) >= scrollHeight && !isBottom) setIsBottom(true);

//   // Remove readed messages from count
//   if (chatStore.newMessagesAllHeight > 0 && offSetFromBottom < chatStore.newMessagesAllHeight && !initialScroll) {
//     readMessages(offSetFromBottom);
//   }
// };

// if (currentChat && !currentChat.messages) {
//   chatStore.loadMessages(currentChat.id, null);
//   return (
//     <div className='chat'>
//       <div className='loading chat_loading'>
//         <PuffLoader color='#3498db' size={50} />
//       </div>
//     </div>
//   );
// }

{
  /* {fireMessages &&
                  fireMessages.map((msg: IMsg, index: number) => {
                    if (index > 24)
                      return (
                        <Msg
                          key={msg.id}
                          isCollectingHeightNews={fireMessages.length > 0 && !initialScroll}
                          isCollectingHeightPrevs={chatStore.isLoadingPrev}
                          collectHeightPrevs={collectHeightPrevs}
                          collectHeightNews={collectHeightNews}
                          last_date={last_date}
                          msg={msg}
                        />
                      );
                    return null;
                  })}
                {fireFirstSync &&
                  fireFirstSync.map((msg: IMsg) => {
                    return <Msg key={msg.id} last_date={last_date} msg={msg} />;
                  })} */
}

{
  /* <div className='message-list-container'>
                  <AutoSizer onResize={onResize}>
                    {({ height, width }: any) => (
                      <List
                        ref={onRefChange}
                        // innerRef={onInnerRefChange}
                        onItemsRendered={ItemsRenderedHandler}
                        className='chatlist-container'
                        height={height - 20}
                        itemData={itemData}
                        itemCount={fireMessages.length}
                        itemSize={getItemSize}
                        width={width}
                        overscanCount={5}
                      >
                        {renderMessage}
                      </List>
                    )}
                  </AutoSizer>
                </div> */
}
