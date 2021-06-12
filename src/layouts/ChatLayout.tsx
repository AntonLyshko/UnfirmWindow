import React from "react";
import { inject, observer } from "mobx-react";
import IStores from "@stores/interface";
import Header from "@components/chat/Header";
import ChatWrapper from "@components/chat/ChatWrapper";

type IProps = {};

const ChatLayout = inject((stores: IStores) => ({}))(
  observer((props: IProps) => {
    return (
      <div className='chat_layout'>
        <Header />
        <ChatWrapper />
      </div>
    );
  })
);

export default ChatLayout;
