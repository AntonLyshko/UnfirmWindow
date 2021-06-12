import React, { Fragment, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import IStores, { IAppStore, IChatStore, IContactStore, IUserStore } from "@stores/interface";
import HashLoader from "react-spinners/HashLoader";
import "./ContactList.scss";
import "./Contact.scss";
// import moment from "moment";
import ChatItem from "./comp/ChatItem";
import ContactItem from "./comp/ContactItem";
import { firechat } from "@stores/implementation/Firebase/firebase";
import { PlusOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useAsync } from "react-async";

type IProps = {
  contactStore?: IContactStore;
  stores?: IAppStore;
  userStore?: IUserStore;
  chatStore?: IChatStore;
  appStore?: IAppStore;
  onSelect?: () => void | null;
};

const ContactList = inject((stores: IStores) => ({
  contactStore: stores.contactStore,
  userStore: stores.userStore,
  chatStore: stores.chatStore,
  appStore: stores.appStore,
}))(
  observer((props: IProps) => {
    const { contactStore, chatStore, appStore, userStore } = props;
    let ContactsData = contactStore.contact;
    let activeContact = contactStore.activeContact;

    const filterSwitch = contactStore.filterSwitch;
    const fireContacts = contactStore.fireContacts ? contactStore.fireContacts : [];
    const fireChats = chatStore.chats ? chatStore.chats : [];
    const [activeContactList, setActiveContactList] = useState(false);

    useEffect(() => {
      if (userStore.hero) {
        let heroConnection = firechat.lastConnection(userStore.hero.id) || null;
        firechat.db.ref(".info/connected").on("value", (snapshot: any) => {
          if (snapshot.val() == false) {
            heroConnection.set(true);
            return;
          }
          if (heroConnection) heroConnection.onDisconnect().set(false);
        });
      }
    }, [userStore.hero]);

    useEffect(() => {
      firechat
        .contacts("fireschool")
        .limitToLast(25)
        .on("value", (snapshot: any) => {
          contactStore.updateFireContacts(snapshot.val());
        });
    }, []);

    useEffect(() => {
      firechat
        .chats()
        .limitToLast(25)
        .on("value", (snapshot: any) => {
          chatStore.updateFireChats(snapshot.val());
        });
    }, []);

    // const loadPrevContacts = async () => {
    // let bottomMessage = fireContacts[fireContacts.length - 1];
    // let prevContacts = await firechat.getPrevContact(bottomMessage.last_message.time);
    // contactStore.updateFireContacts(prevContacts, bottomMessage);
    // };

    // const increaseLimit = _.debounce(
    //   async () => {
    //     if (!contactStore.isLoadingPrev) {
    //       contactStore.setLoadingPrev(true);
    //       await loadPrevContacts();
    //     }
    //   },
    //   3550,
    //   { leading: true, trailing: false }
    // );

    const handleScroll = () => {
      //   let scrollTop = msgSpace.current.scrollTop;
      //   let clientHeight = msgSpace.current.clientHeight;
      //   let scrollHeight = msgSpace.current.scrollHeight;
      //   // Pagination
      //   if (scrollTop < 350 && actionStatus === "TouchEnd") increaseLimit();
      //   // isBottom or not
      //   if (scrollHeight - scrollTop - clientHeight > 100 && isBottom) setIsBottom(false);
      //   if (Math.ceil(scrollTop + clientHeight) >= scrollHeight && !isBottom) {
      //     setIsBottom(true);
      //   }
    };

    const selectContact = async (id: any) => {
      await chatStore.setActiveChatByContactId(id);
      console.log(activeContact);
      if (activeContact) {
        appStore.setLayout("contact");
      } else {
        appStore.setLayout("chat");
      }
    };

    const selectChat = async (id: any) => {
      await chatStore.setActiveChatByChatId(id);

      if (activeContact) {
        appStore.setLayout("contact");
      } else {
        appStore.setLayout("chat");
      }
    };

    // const addContact = async (id: any) => {
    //   setActiveContactList(false);
    //   await contactStore.createFireContact(id);
    //   await contactStore.setActiveContact(id);
    // };

    // const contactTime = (date: any, time: any) => {
    //   let now = moment(new Date());
    //   let contact_date = moment(date, "DD.MM");
    //   let diff = now.diff(contact_date, "days");

    //   if (diff === 0) return <span>{time}</span>;

    //   return (
    //     <span>
    //       {contact_date.format("dd")} {date}
    //     </span>
    //   );
    // };

    if (!appStore.loaded) {
      return (
        <div className='loading'>
          <HashLoader color='#3498db' size={50} />
        </div>
      );
    }

    const getBuddyContact = async ({ chat }: any) => {
      return await contactStore.getBuddyContact(chat);
    };

    const ChatListItem = ({ chat, index }: any) => {
      if (!chat.id) return <></>;
      const { data }: any = useAsync({ promiseFn: getBuddyContact, chat });
      if (data) {
        let chatName = data.name;
        let online = data.online;
        let last_message = chat.last_message ? chat.last_message : null;
        let unreadedCount = chat.users[userStore.hero.id];
        let avatar = chat.avatar ? chat.avatar : data.avatar;

        return (
          <ChatItem
            index={index}
            key={chat.id}
            chatId={chat.id}
            selectChat={selectChat}
            activeChat={activeContact}
            avatar={avatar}
            name={chatName}
            online={online}
            last_message={last_message}
            unreadedCount={unreadedCount}
          />
        );
      }
      return <>Загрузка...</>;
    };

    return (
      <div className={`menu_list ${filterSwitch ? "active" : ""}`}>
        <div className='tab-content'>
          <div className='tab-pane active' id='chats-content'>
            <div className='scroller d-flex flex-column h-100'>
              <div onScroll={() => handleScroll()} className='hide-scrollbar h-100' id='chatContactsList'>
                <ul className='contacts-list' id='chatContactTab' data-chat-list=''>
                  {fireChats.map((chat: any, index: number) => {
                    return <ChatListItem key={Math.random()} chat={chat} index={index} />;
                  })}

                  {fireChats && !fireChats.length ? (
                    <Fragment>
                      <li className={`contacts-item friends`}>
                        <div className='announcement'>Контактов нет ¯\_(ツ)_/¯</div>
                      </li>
                    </Fragment>
                  ) : (
                    <Fragment></Fragment>
                  )}
                </ul>
              </div>
              <div className={`put-contact-in-fire ${activeContactList ? "active" : ""}`}>
                <div onClick={() => setActiveContactList(!activeContactList)} className='header'>
                  {activeContactList ? (
                    <>
                      Убрать список контактов <ArrowDownOutlined />
                    </>
                  ) : (
                    <>
                      Добавить чат <PlusOutlined />
                    </>
                  )}
                </div>
                <ul className='contacts-list' id='chatContactTab' data-chat-list=''>
                  {ContactsData.map((contact: any, index: number) => {
                    if (!contact) return null;
                    return;
                  })}
                  {fireContacts.map((contact: any, index: number) => {
                    if (!contact.id || contact.id === userStore.hero.id) return null;

                    return <ContactItem key={contact.id} addContact={selectContact} contact={contact} index={index} />;
                  })}
                  {ContactsData && !ContactsData.length ? (
                    <Fragment>
                      <li className={`contacts-item friends`}>
                        <div className='announcement'>Контактов нет ¯\_(ツ)_/¯</div>
                      </li>
                    </Fragment>
                  ) : (
                    <Fragment></Fragment>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })
);

export default ContactList;
