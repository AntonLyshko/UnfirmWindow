import React, { Fragment, useCallback } from "react";
import "./Chat.scss";
import _ from "lodash";

import Msg from "./comp/Msg";
import { VariableSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memoize from "memoize-one";
import { Divider } from "antd";

// import { Menu, Dropdown, Divider } from "antd";
// import SmileMenu from './comp/SmileMenu'
// import PuffLoader from "react-spinners/PuffLoader";

type IProps = {
  chatListRef?: any;
  fireMessages?: any;
  msgSpace?: any;
  isBottomZone?: boolean;
  isBottom?: boolean;
  initialScroll?: any;
  increaseLimit?: any;
  setIsBottomZone?: any;
  setIsBottom?: any;
  setInitialScroll?: any;
  scrollBottomTrigger?: boolean;
  setChatRef?: (node: any) => void;
  scrollBottom?: () => void;
  lastSeenMessage?: any;
  newMessageCount?: any;
  setNewMessageCount?: any;
};

const Chat = React.memo((props: IProps) => {
  const {
    chatListRef,
    fireMessages,
    msgSpace,
    isBottomZone,
    setIsBottomZone,
    setIsBottom,
    isBottom,
    setChatRef,
    scrollBottom,
    initialScroll,
    increaseLimit,
    setInitialScroll,
    scrollBottomTrigger,
    lastSeenMessage,
    newMessageCount,
    setNewMessageCount,
  } = props;

  // useWhyDidYouUpdate("Chat", props);

  const onRefChange = useCallback((node) => {
    setChatRef(node);
  }, []);

  // ? render actions

  const resetMessages = _.debounce(
    async () => {
      if (chatListRef) await chatListRef.resetAfterIndex(0);
    },
    350,
    {
      leading: false,
      trailing: true,
    }
  );

  const onResize = () => resetMessages();

  const getItemSize = (index: number) => {
    let messageHeight = 60;
    let symbolWidth = 8.56;
    let symbolHeight = 21.25;
    let paddingFromBorder = 20;
    let maxMessageWidth = 0.5;
    let sidePadding = 15;
    let topAndBottomPadding = 14;
    let underMessageSpace = 28;
    let marginBottom = 10;

    const message = fireMessages[index];
    const contentLen = message.content.length;
    const chatWidth = msgSpace.current.offsetWidth;
    const stringWidth = contentLen * symbolWidth;
    const MaxStringMessageWidth = (chatWidth - paddingFromBorder) * maxMessageWidth - sidePadding;
    const stringCount = Math.ceil(stringWidth / MaxStringMessageWidth);
    messageHeight = stringCount * symbolHeight + topAndBottomPadding + underMessageSpace + marginBottom;
    if (stringCount === 1) messageHeight += 5;

    if (message["unreadDivider"]) messageHeight += 50;
    return messageHeight;
  };

  const createItemData = memoize((fireMessages) => ({
    fireMessages,
  }));

  const itemData = createItemData(fireMessages);

  const renderMessage = React.memo(({ data, index, isScrolling, style }: any) => {
    const { fireMessages } = data;

    const message = fireMessages[index];
    const customStyle = {};

    console.log("message", message);

    return (
      <div style={{ ...style, ...customStyle }} key={message.id}>
        {isScrolling ? (
          <Fragment></Fragment>
        ) : (
          <Fragment>
            <Msg last_date={null} msg={message} />

            {lastSeenMessage && index !== fireMessages.length - 1 && message.id === lastSeenMessage.id ? (
              <Divider className='new-message-divider'>Непрочитанные сообщения</Divider>
            ) : null}
          </Fragment>
        )}
      </div>
    );
  }, areEqual);

  const ItemsRenderedHandler = (props: any) => {
    const visiableTop = props.visibleStartIndex;
    const visiableBottom = props.visibleStopIndex;
    const fromBottom = fireMessages.length - visiableBottom - 1;

    if (fromBottom < newMessageCount) {
      setNewMessageCount(newMessageCount - fromBottom);
    }

    if (visiableTop <= 5 && initialScroll && chatListRef) scrollBottom();

    if (visiableBottom + 3 >= fireMessages.length) {
      if (!isBottomZone) setIsBottomZone(true);
    } else {
      if (isBottomZone) setIsBottomZone(false);
    }

    if (visiableBottom === fireMessages.length - 1) {
      if (initialScroll) setInitialScroll(false);
      if (!isBottom) setIsBottom(true);
    } else {
      if (isBottom && !scrollBottomTrigger) setIsBottom(false);
      if (isBottom && scrollBottomTrigger) scrollBottom();
    }

    if (visiableTop <= 5 && !initialScroll && fireMessages.length > 24) {
      increaseLimit(visiableTop);
    }
  };

  return (
    <div className='message-list-container'>
      <AutoSizer onResize={onResize}>
        {({ height, width }: any) => (
          <List
            ref={onRefChange}
            onItemsRendered={ItemsRenderedHandler}
            className='chatlist-container'
            height={height}
            itemData={itemData}
            itemCount={fireMessages.length}
            itemSize={getItemSize}
            width={width}
          >
            {renderMessage}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

export default Chat;
