import React, { Fragment, useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import IStores, { IChatStore, IContactStore, IUserStore, IAppStore } from "@stores/interface";
import { Icon } from "@ui";
// import $ from "jquery";
import { Input, Menu, Button, Popover, Modal, Switch } from "antd";
import SocialMenu from "./SocialMenu";
// import SmileMenu from './comp/SmileMenu'
import { firechat } from "@stores/implementation/Firebase/firebase";
import moment from "moment";

// TODO Auto focus on input

type IProps = {
  chatStore?: IChatStore;
  contactStore?: IContactStore;
  userStore?: IUserStore;
  appStore?: IAppStore;
  helperMenu?: any;
};

const Inputer = inject((stores: IStores) => ({
  chatStore: stores.chatStore,
  contactStore: stores.contactStore,
  userStore: stores.userStore,
}))(
  observer((props: IProps) => {
    const { chatStore, userStore } = props;
    const currentChat = chatStore.activeChat;
    const activeMsg = chatStore.activeMsg;
    const hero = userStore.hero;

    const [draft, setDraft] = useState({});
    const [switcher, setSwitcher] = useState("");
    const [status, setStatus] = useState("default");

    const [acceptType, setAcceptType] = useState("file_extension|audio/*|video/*|image/*|media_type");
    const [currentFileType, setCurrentFileType] = useState("file");
    const [fileOnHold, setFileOnHold] = useState([]);
    const [fileToSend, setFileToSend] = useState([]);
    const [heroIsParticipant, setHeroIsParticipant] = useState(false);

    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    let toSend: any = [];

    useEffect(() => {
      inputRef.current.value = "";
      let target = null;
      Object.keys(currentChat.users).map((key: string) => {
        if (key == hero.id) target = currentChat.users[key];
      });
      console.log("target", target !== null);
      setHeroIsParticipant(target !== null);
    }, []);

    const [keys, setKeys] = useState({
      shift: false,
      alt: false,
      ctrl: false,
    });

    const clearKeyPress = () => {
      setKeys({
        shift: false,
        alt: false,
        ctrl: false,
      });
    };

    const handleKeyDown = (e: any) => {
      switch (e.key) {
        case "Control":
          setKeys({ ...keys, ctrl: true });
          break;
        case "Shift":
          setKeys({ ...keys, shift: true });
          break;
        case "Alt":
          setKeys({ ...keys, alt: true });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: any) => {
      switch (e.key) {
        case "Control":
          setKeys({ ...keys, ctrl: false });
          break;
        case "Shift":
          setKeys({ ...keys, shift: false });
          break;
        case "Alt":
          setKeys({ ...keys, alt: false });
          break;
        default:
          break;
      }
    };

    const fireSend = async (message: string) => {
      if (message) {
        let buddies: any = {};

        Object.keys(currentChat.users).map((key: string) => {
          buddies[key] = currentChat.users[key] + 1;
          if (key == hero.id) buddies[key] = 0;
          if (!heroIsParticipant) {
            buddies[hero.id] = 0;
            setHeroIsParticipant(true);
          }
        });

        let messageBody = {
          chatId: currentChat.id,
          cuid: hero.id,
          avatar: hero.avatar,
          username: hero.username,
          time: moment().valueOf(),
          content: message,
          social_media: "uniform",
          readed: false,
          buddies,
        };

        toSend = [...toSend, messageBody];
        setTimeout(() => {
          firechat.addArrayMessage(toSend);
          toSend = [];
        }, 100);
      }
    };

    const handleEnter = async (e: any) => {
      e.preventDefault();
      setDraft({ ...draft, [currentChat.id + status]: "" });
      if (keys.alt || keys.shift || keys.ctrl) {
        let text = "";
        if (draft[currentChat.id + status]) text = draft[currentChat.id + status] + "\n";
        setDraft({ ...draft, [currentChat.id + status]: text });
      } else {
        if (draft[currentChat.id + status] && draft[currentChat.id + status].length) {
          let message = draft[currentChat.id + status];
          fireSend(message);
          clearKeyPress();
          // setFileOnHold([])
          // setFileToSend([])
        }
        setDraft({ ...draft, [currentChat.id + status]: "" });
      }
    };

    const onChange = (name: string, value: string, event: any) => {
      setDraft({ ...draft, [name + status]: value });
    };

    const onSend = async () => {
      let message = draft[currentChat.id + status];

      if (message && message.length) {
        switch (status) {
          case "default":
            fireSend(message);
            clearKeyPress();
            break;
          case "edit":
            // activeMsg.editMsg(draft[activeContact.id + status]);
            // chatStore.setActiveMsg(null, currentChat.id);
            break;
          case "reply":
            // chatStore.addMsg(message, hero.id, currentChat.activeSocial, activeMsg["content"]);
            // chatStore.setActiveMsg(null, currentChat.id);
            break;
          default:
            break;
        }
        setDraft({ ...draft, [currentChat.id + "default"]: "", [currentChat.id + status]: "" });
        setStatus("default");
      }

      inputRef.current.value = "";
    };

    const activeFileHandler = async (value: string, type: string) => {
      await setCurrentFileType(type);
      await setAcceptType(value);
      await setSwitcher("");
      fileInputRef.current.click();
    };

    const DropDownAttachments = () => {
      return (
        <Menu>
          <Menu.Item onClick={() => activeFileHandler("image/*", "image")}>Фотография</Menu.Item>
          <Menu.Item onClick={() => activeFileHandler("video/*", "video")}>Видео</Menu.Item>
          <Menu.Item onClick={() => activeFileHandler("file_extension|audio/*|video/*|image/*|media_type", "file")}>
            Документ
          </Menu.Item>
          <Menu.Item onClick={() => activeFileHandler("audio/*", "audio")}>Аудио</Menu.Item>
        </Menu>
      );
    };

    const selectSocial = (social: string) => {
      currentChat.changeSocial(social);
      setSwitcher("");
    };

    const { TextArea } = Input;

    const handleFileInput = (e: any) => {
      e.preventDefault();

      let fileArray: any = [];
      for (let i = 0; i < e.target.files.length; i++) {
        let file = e.target.files.item(i);

        if (
          (file.size > 10485760 && currentFileType === "video") ||
          currentFileType === "file" ||
          currentFileType === "audio"
        ) {
          let data = {
            type: currentFileType,
            file: file,
          };
          fileArray.push(data);
          continue;
        }

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const { result } = e.target;
          let data = {
            url: result,
            type: currentFileType,
            file: file,
          };
          fileArray.push(data);
        };
      }

      setFileToSend([...fileToSend, ...e.target.files]);
      setFileOnHold([...fileOnHold, ...fileArray]);

      fileInputRef.current.value = null;
    };

    const bytesToSize = (bytes: any) => {
      let sizes = ["Bytes", "KB", "MB", "GB", "TB"];

      if (bytes == 0) {
        return "0 Byte";
      }

      let i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

      // @ts-ignore
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    };

    const deleteFileOnHold = (index: number) => {
      let fileOnHoldCopy = fileOnHold.slice();
      fileOnHoldCopy.splice(index, 1);
      setFileOnHold(fileOnHoldCopy);

      let fileToSendCopy = fileToSend.slice();
      fileToSendCopy.splice(index, 1);
      setFileToSend(fileToSendCopy);
    };

    const changeFileOnHold = async (index: number) => {
      await fileInputRef.current.click();
      await deleteFileOnHold(index);
    };

    const modalFileContoller = (index: number) => (
      <div className='file_modal-file-controller'>
        <div onClick={() => deleteFileOnHold(index)} className='file_controller-item delete'>
          <Icon className='icon_m lite-grey' name='solid_times' />
        </div>
        <div onClick={() => changeFileOnHold(index)} className='file_controller-item change'>
          <Icon className='icon_s lite-grey' name='solid_pen' />
        </div>
      </div>
    );

    return (
      <div className='inputer'>
        <Modal
          visible={fileOnHold.length > 0}
          onCancel={() => {
            setFileOnHold([]);
            setFileToSend([]);
          }}
          footer={[
            <Button
              key='back'
              className='font_size-normal'
              type='primary'
              onClick={() => {
                setFileOnHold([]);
                setFileToSend([]);
              }}
            >
              Отмена
            </Button>,
            <Button key='submit' className='font_size-normal' type='primary' onClick={handleEnter}>
              Отправить
            </Button>,
          ]}
        >
          <div className='file_modal'>
            <div className='file-holder-container'>
              {fileOnHold.map((file_item: any, index: number) => {
                if (file_item.type === "image") {
                  return (
                    <div key={Math.random()} className='file-holder'>
                      {modalFileContoller(index)}
                      <div className='file-holder-preview'>
                        <div className='content'>
                          <img src={file_item.url} alt='' />
                        </div>
                      </div>

                      <div className='file-holder-info'>
                        <div className='name'>{file_item.file.name}</div>
                        <div className='size'>{bytesToSize(file_item.file.size)}</div>
                      </div>
                    </div>
                  );
                }
                if (file_item.type === "audio") {
                  return (
                    <div className='file-holder video-holder'>
                      {modalFileContoller(index)}
                      <div className='file-holder-preview'>
                        <div className='content'>
                          <div className='play-icon'>
                            <Icon className='icon_m white' name='solid_file-audio' />
                          </div>
                          {file_item.url ? (
                            <Fragment>
                              <video autoPlay muted>
                                <source src={file_item.url} type='video/mp4' />
                              </video>
                            </Fragment>
                          ) : (
                            <Fragment></Fragment>
                          )}
                        </div>
                      </div>
                      <div className='file-holder-info'>
                        <div className='name'>{file_item.file.name}</div>
                        <div className='size'>{bytesToSize(file_item.file.size)}</div>
                      </div>
                    </div>
                  );
                }
                if (file_item.type === "file") {
                  return (
                    <div className='file-holder video-holder'>
                      {modalFileContoller(index)}
                      <div className='file-holder-preview file'>
                        <div className='content'>
                          <div className='play-icon'>
                            <Icon className='icon_m white' name='solid_file' />
                          </div>
                        </div>
                      </div>
                      <div className='file-holder-info'>
                        <div className='name'>{file_item.file.name}</div>
                        <div className='size'>{bytesToSize(file_item.file.size)}</div>
                      </div>
                    </div>
                  );
                }
                if (file_item.type === "video") {
                  return (
                    <div className='file-holder video-holder'>
                      {modalFileContoller(index)}
                      <div className='file-holder-preview'>
                        <div className='content'>
                          <div className='play-icon'>
                            <Icon className='icon_m white' name='solid_play' />
                          </div>
                          {file_item.url ? (
                            <Fragment>
                              <video autoPlay muted>
                                <source src={file_item.url} type='video/mp4' />
                              </video>
                            </Fragment>
                          ) : (
                            <Fragment></Fragment>
                          )}
                        </div>
                      </div>
                      <div className='file-holder-info'>
                        <div className='name'>{file_item.file.name}</div>
                        <div className='size'>{bytesToSize(file_item.file.size)}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div className='file_modal-options'>
              {fileOnHold.find((file: any) => file.type === "image") && (
                <div className='compression-switch'>
                  <Switch size='small' defaultChecked />
                  Оптимизировать изображения
                </div>
              )}
            </div>
            <div className='file_modal-input'>
              <div className='inputer_btn'>
                <Popover
                  onVisibleChange={(e) => {
                    e ? {} : setSwitcher("");
                  }}
                  visible={switcher === "attachments_modal"}
                  content={<DropDownAttachments />}
                  trigger='click'
                >
                  <Button
                    onClick={() => {
                      switcher === "attachments_modal" ? setSwitcher("") : setSwitcher("attachments_modal");
                    }}
                    className='transparent'
                  >
                    <Icon className='icon_m blue-lite' name='solid_plus' />
                  </Button>
                </Popover>
              </div>

              <div className='main_input in_modal'>
                <TextArea
                  onKeyDown={(e) => handleKeyDown(e)}
                  onKeyUp={(e) => handleKeyUp(e)}
                  onPressEnter={(e) => handleEnter(e)}
                  autoSize
                  placeholder='Ваше сообщение'
                  ref={inputRef}
                  onChange={(e) => onChange(currentChat.id, e.target.value, e)}
                  value={draft[currentChat.id + status]}
                />
              </div>
            </div>
          </div>
        </Modal>

        <div className='input-container'>
          {/*<div className="inputer_btn">*/}
          {/*	<div className='helper_menu'>*/}
          {/*		<AlignCenterOutlined onClick={props.helperMenu}/>*/}
          {/*	</div>*/}
          {/*</div>*/}

          <div className='inputer_btn'>
            {/* убрать единичку */}
            <Popover
              onVisibleChange={(e) => {
                e ? {} : setSwitcher("");
              }}
              visible={switcher === "1social"}
              content={<SocialMenu selectSocial={selectSocial} />}
              trigger='click'
            >
              <Button onClick={() => setSwitcher("social")} className='transparent not-allowed'>
                <Icon
                  className='icon_l'
                  name={`social_media_${currentChat.activeSocial ? currentChat.activeSocial : ""}`}
                />
              </Button>
            </Popover>
          </div>
          {!heroIsParticipant && <div className='input-warning'>Вы не являетесь участником беседы. Вступить?</div>}
          <div className='main_input'>
            {activeMsg ? (
              <Fragment>
                <div className='selected-container'>{activeMsg["content"]}</div>
              </Fragment>
            ) : (
              <Fragment></Fragment>
            )}
            <TextArea
              onKeyDown={(e) => handleKeyDown(e)}
              onKeyUp={(e) => handleKeyUp(e)}
              onPressEnter={(e) => handleEnter(e)}
              autoSize
              placeholder='Ваше сообщение'
              ref={inputRef}
              onChange={(e) => onChange(currentChat.id, e.target.value, e)}
              value={draft[currentChat.id + status]}
            />
          </div>

          <div className='inputer_btn'>
            <Popover
              onVisibleChange={(e) => {
                e ? {} : setSwitcher("");
              }}
              visible={switcher === "attachments"}
              content={<DropDownAttachments />}
              trigger='click'
            >
              <Button
                onClick={() => {
                  switcher === "attachments" ? setSwitcher("") : setSwitcher("attachments");
                }}
                className='transparent'
              >
                <Icon className='icon_m blue-lite' name='solid_paperclip' />
              </Button>
            </Popover>
          </div>
        </div>

        <div onClick={() => onSend()} className='send_btn'>
          <Icon className='icon_x white' name='solid_another-arrow' />
        </div>
        <input
          type='file'
          hidden
          accept={acceptType}
          name='files'
          ref={fileInputRef}
          multiple
          onChange={handleFileInput}
        />
      </div>
    );
  })
);

export default Inputer;
