import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import IStores, { IContactStore, IAppStore, IChatStore, IUserStore } from "@stores/interface";
import ChatItem from "./ChatItem";

type IProps = {
  contactStore?: IContactStore;
  chat?: any;
  index?: number;
  appStore?: IAppStore;
  chatStore?: IChatStore;
  userStore?: IUserStore;
};

const ContactList = inject((stores: IStores) => ({
  contactStore: stores.contactStore,
  chatStore: stores.chatStore,
  appStore: stores.appStore,
  userStore: stores.userStore,
}))(
  observer((props: IProps) => {
    const { appStore, chatStore, contactStore, chat, index, userStore } = props;
    let activeContact = contactStore.activeContact;

    const [buddy, setBuddy] = useState(null);

    const selectChat = async (id: any) => {
      await chatStore.setActiveChatByChatId(id);

      if (activeContact) {
        appStore.setLayout("contact");
      } else {
        appStore.setLayout("chat");
      }
    };

    useEffect(() => {
      // Buddy - пользователь который не является менеджером
      (async () => {
        const buddy: any = await contactStore.getBuddyContact(chat);
        console.log("buddy", buddy);
        setBuddy(buddy);
      })();
    }, []);

    if (!chat.id) return <></>;

    // ToDO firebase отдает только чаты, в массиве пользователей есть heroID

    if (buddy) {
      let chatName = buddy.name;
      let online = buddy.online;
      let last_message = chat.last_message ? chat.last_message : null;
      let unreadedCount = chat.users[userStore.hero.id];
      let avatar = chat.avatar ? chat.avatar : buddy.avatar;

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
  })
);

export default ContactList;
