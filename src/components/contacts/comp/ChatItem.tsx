import React, { Fragment } from "react";
import { Badge } from "antd";
import { Icon } from "@ui";
import moment from "moment";

type IProps = {
  selectChat?: (id: string) => void;
  index?: any;
  key?: any;
  chatId?: string;
  activeChat?: any;
  online?: boolean;
  last_message?: any;
  unreadedCount?: number;
  name?: string;
  avatar?: string;
};

const ChatItem = React.memo((props: IProps) => {
  const { name, avatar, chatId, selectChat, activeChat, index, online, last_message, unreadedCount } = props;

  return (
    <li
      onClick={() => selectChat(chatId)}
      className={`contacts-item friends contact-item-${index}
            ${activeChat && activeChat.id === chatId ? "active" : ""}`}
      key={index}
    >
      <div className='avatar'>
        {!!last_message && (
          <div className={`social_media_icon white ${last_message.social_media}`}>
            <Icon className='icon_s' name={`social_media_${last_message.social_media}`} />
          </div>
        )}

        <Badge className={`online_dot ${activeChat && activeChat.id === chatId ? "active" : ""}`} dot={online}>
          <img src={avatar} alt='' />
        </Badge>
      </div>
      <div className='contacts-content'>
        <div className='contacts-info'>
          <h4 className='chat-name user_name_to'>{name}</h4>
          <div className='chat-time'>
            {last_message ? <Fragment>{moment(last_message.time).format("HH:mm")}</Fragment> : <Fragment></Fragment>}
          </div>
        </div>
        <div className='contacts-texts'>
          {last_message ? (
            <Fragment>
              <div className={`last_msg ${status}`}>
                <div>
                  <div className='from'>{last_message.income ? "" : "You:"}</div>
                  {last_message.content}
                </div>
                {unreadedCount > 0 ? (
                  <Fragment>
                    <div className='unreaded_count'>{unreadedCount}</div>
                  </Fragment>
                ) : (
                  <Fragment></Fragment>
                )}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className={`last_msg ${status}`}>*Добавлен в контакты*</div>
            </Fragment>
          )}
        </div>
      </div>
    </li>
  );
});

export default ChatItem;
