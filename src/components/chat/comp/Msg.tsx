import React, { useRef, useMemo } from "react";
// import { Divider } from "antd";
import { Icon } from "@ui";
import moment from "moment";

type IProps = {
  msg?: any;
  last_date?: any;
};

const Msg = React.memo((props: IProps) => {
  const { msg } = props;
  const msgRef = useRef(null);

  // const editMsg = (id: string) => {
  // 	let msg = chatStore.getMsg(id, currentChat.id)
  // 	chatStore.setActiveMsg(msg, currentChat.id)
  // 	setDraft({...draft, [activeContact.id + 'edit']: msg.content})
  // 	setStatus('edit')
  // }
  // const deleteMsg = (id: string) => {
  // 	chatStore.deleteMsg(id, currentChat.id)
  // 	setReRender(!reRender)
  // }
  // const selectMsg = (id: string) => {
  // 	let msg = chatStore.getMsg(id, currentChat.id)
  // 	chatStore.setActiveMsg(msg, currentChat.id)
  // 	setDraft({...draft, [activeContact.id + 'reply']: draft[activeContact.id + status]})
  // 	setStatus('reply')
  // }

  // const replyMsg = (id: string) => {
  // 	setReRender(!reRender)
  // }

  // const DropDownMenu = (msg: any) => {
  // 	return (
  // 		<Menu>
  // 			<Menu.Item onClick={() => editMsg(msg.id)}>
  // 				Редактировать
  // 			</Menu.Item>
  // 			<Menu.Item onClick={() => selectMsg(msg.id)}>
  // 				Выбрать
  // 			</Menu.Item>
  // 			<Menu.Item onClick={() => deleteMsg(msg.id)}>
  // 				Удалить
  // 			</Menu.Item>
  // 			<Menu.Item onClick={() => replyMsg(msg.id)}>
  // 				Переслать
  // 			</Menu.Item>
  // 		</Menu>
  // 	)
  // }

  // ! sms blocks in user
  // const renderMessagesHeader = (msg: any) => <>
  // 	{
  // 		msg.income ? (<Fragment>

  // 			{!msg.flowMessagePrevious && msg.flowMessageNext && !msg.center ? (<div className="msg_header">
  // 				<span>{msg.username}</span>
  // 				{/* <span className="msg-role">{msg.role ? msg.role.name : ''}</span> */}
  // 			</div>) : ''}

  // 			{!msg.flowMessageNext && !msg.flowMessagePrevious ? (<div className="msg_header">
  // 				<span>{msg.username}</span>
  // 				{/* <span className="msg-role">{msg.role ? msg.role.name : ''}</span> */}
  // 			</div>) : ''}

  // 		</Fragment>) : (<Fragment>

  // 			{!msg.flowMessagePrevious && msg.flowMessageNext && !msg.center ? (<div className="msg_header">
  // 				<span>{hero.username}</span>
  // 				{/* <span className="msg-role">{msg.role ? msg.role.name : ''}</span> */}
  // 			</div>) : ''}

  // 			{!msg.flowMessageNext && !msg.flowMessagePrevious ? (<div className="msg_header">
  // 				<span>{hero.username}</span>
  // 				{/* <span className="msg-role">{msg.role ? msg.role.name : ''}</span> */}
  // 			</div>) : ''}

  // 		</Fragment>)
  // 	}
  // </>

  //render chat content
  // const renderDataTimeBlock = (time: string) => (
  //   <div className='date_container'>
  //     <Divider orientation='center' className='date_divider'>
  //       <div className='date'>{time}</div>
  //     </Divider>
  //   </div>
  // );

  // const renderDataContainerUnread = () => (
  //   <div className='date_container unread'>
  //     <Divider orientation='center' className='date_divider unread'>
  //       <div className='date unread'>Непрочитанные сообщения</div>
  //     </Divider>
  //   </div>
  // );

  const renderMessagesWrapper = (msg: any) => (
    <div className='message-wrapper'>
      <div className={`message-content ${msg.flowMessageNext ? "not-main" : ""} `}>
        {msg.reply ? (
          <div className='reply'>
            <span>{msg.reply.content}</span>
          </div>
        ) : (
          ""
        )}
        <div className='inset_border_container'>
          <div className='dummy' />
          <div className='border_hero' />
        </div>
        <div className='msg_text_container'>
          {Array.isArray(msg.content) ? (
            <div className='msg_file_container'>
              {msg.content.map((content_item: any, index: number) => {
                if (content_item.type === "image") {
                  return (
                    <div key={Math.random()} className={`msg_content-image ${"image_count_" + msg.content.length}`}>
                      <img src={content_item.url} alt='' />
                    </div>
                  );
                }
                if (content_item.type === "file") {
                  return (
                    <div key={Math.random()} className='msg_content-file'>
                      File
                    </div>
                  );
                }
                if (content_item.type === "audio") {
                  return (
                    <div key={Math.random()} className='msg_content-audio'>
                      Audio
                    </div>
                  );
                }
                if (content_item.type === "video") {
                  return (
                    <div key={Math.random()} className='msg_content-video'>
                      Video
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <>{msg.content}</>
          )}
        </div>
        <div className='msg_type'>
          {/* Конвертики */}
          {/* {
                          msg.type === 'message' ? (<Fragment>
                              <Icon name="regular_envelope" className={`icon_s lite-grey`} />
                          </Fragment>) : (<Fragment></Fragment>)
                      } */}
        </div>
        {/* <div className={`smile ${switcher === msg.id ? 'active' : ''}`}>
                   <Popover onVisibleChange={(e) => { e ? {} : setSwitcher('') }} visible={switcher === msg.id} content={<SmileMenu id={msg.id} chat_id={currentChat.id} switcherOff={switcherOff} /trigger="click">
                   <Button onClick={() => { switcher === msg.id ? setSwitcher('') : setSwitcher(msg.id) }} className='transparent'>
                   <Icon className={`icon_s active-grey`} name='regular_smile' />
                   </Button>
                   </Popover>
                   </div> */}
        {/* <div className="smile_realization">
                   {
                   msg.smiles && msg.smiles.length ? (<Fragment>
                   {
                   msg.smiles.map((smile: string) => {
                   return (
                   <div className="smile_msg">
                   {smile}
                   </div>
                   )
                   })
                   }
                   </Fragment>) : (<Fragment></Fragment>)
                   }
                   </div> */}
      </div>
    </div>
  );

  const renderMessagesOptions = (msg: any) => {
    const avatarSrc = msg.avatar;

    const Image = useMemo(() => <img src={avatarSrc} />, [avatarSrc]);

    if (!msg.flowMessageNext) {
      return (
        <div className='message-options'>
          <div className='avatar avatar-sm'>
            <div className={`social_media_icon ${msg.social_media}`}>
              <Icon className='icon_s' name={`social_media_${msg.social_media}`} />
            </div>

            {/* <img src={msg.avatar} alt='' /> */}

            {Image}
          </div>
          <span className='message-status'>
            {msg.editted ? (
              <div className='editted_icon'>
                <Icon className='active-grey' name={`solid_pencil-alt`} /> Редак.
              </div>
            ) : (
              ""
            )}
            <div className='msg_time'>
              {msg.readed ? "✔" : "❌"} {moment(msg.time).format("HH:mm")}
            </div>
            {/*<Dropdown overlay={<DropDownMenu id={msg.id}/>} placement="bottomLeft" trigger={['click']}>*/}
            {/*    <span*/}
            {/*        className='dropdown-trigger'>*/}
            {/*        <Icon*/}
            {/*            className='active-grey'*/}
            {/*            name={`regular_three-dots`}/>*/}
            {/*    </span>*/}
            {/*</Dropdown>*/}
          </span>
        </div>
      );
    }

    return null;
  };

  //index rendering functions
  const renderToMeMessages = (msg: any) => {
    return (
      <div id={msg.id}>
        {dateDivider(msg)}

        {/* {!msg.readed ? renderDataContainerUnread() : " "} */}

        <div ref={msgRef} className='message'>
          {/* {renderMessagesHeader(msg)} */}
          {renderMessagesWrapper(msg)}
          {renderMessagesOptions(msg)}
        </div>
      </div>
    );
  };

  let dateDivider = (msg: any) => {
    // let diff: any;
    // let currentDate = moment(msg.date, "DD.MM");
    // if (last_date) diff = currentDate.diff(last_date, "days");
    // last_date = moment(msg.date, "DD.MM");
    // if (diff > 0) return renderDataTimeBlock(currentDate.format("DD.MM"));
    // return null;
  };

  const renderMyMessages = (msg: any) => {
    return (
      <div id={msg.id}>
        {/* {dateDivider(msg)} */}
        <div ref={msgRef} className={`message self ${msg.flowMessageNext ? "not-main" : ""} `}>
          {/* {renderMessagesHeader(msg)} */}
          {renderMessagesWrapper(msg)}
          {renderMessagesOptions(msg)}
        </div>
      </div>
    );
  };

  if (msg.income) {
    return renderToMeMessages(msg);
  } else {
    return renderMyMessages(msg);
  }
});

export default Msg;
