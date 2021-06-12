import { action, observable, reaction } from "mobx";
import { IChat, IChatStore, IContact, IMsg } from "@stores/interface";
import { appStore, contactStore, userStore } from "@stores/implementation";
import { getMessages, sendMessage } from "@actions";
import moment from "moment";
import "moment/locale/ru";
import { firechat } from "@stores/implementation/Firebase/firebase";
import $ from "jquery";

moment.locale("ru");

export class ChatStore implements IChatStore {
  setActiveChat(activeContact: IContact) {
    throw new Error("Method not implemented.");
  }
  @observable chats: IChat[] = [];
  @observable loaded: boolean = false;
  @observable activeChat: IChat;
  @observable activeMsg: IMsg;
  @observable modalWindow: string = "close";
  @observable pageLoading: boolean = false;
  updateMessages: (contact_id: string) => any;
  readAllMsg: (id: string) => void;
  changeSocial: (social: string) => void;

  activeChatPageNumber: number = 1;

  // Firebase variables news
  @observable fireMessages: IMsg[] = [];
  @observable isLoadingPrev: boolean = false;
  @observable haveNext: boolean = true;
  @observable newMessageCount: number = 0;
  @observable scrollBottomTrigger: boolean = false;
  @observable initialScroll: boolean = true;
  @observable isBottom: boolean = false;
  @observable isBottomZone: boolean = false;

  @observable lastSeenMessage: any = null;
  @observable triggerClearTimer: boolean = null;

  newMessagesAllHeight: number = 0;

  constructor() {
    reaction(
      () => {
        return this.chats;
      },
      () => {}
    );
  }

  @action
  setLastSeenMessage(message: any) {
    if (!message) this.toggleUnreadDivider();
    this.lastSeenMessage = message;
    if (message) this.toggleUnreadDivider();
  }

  @action
  toggleUnreadDivider() {
    let message = this.fireMessages.find((m) => m.id === this.lastSeenMessage.id);
    message["unreadDivider"] = !message["unreadDivider"];
  }

  @action
  setIsBottom(value: boolean) {
    this.isBottom = value;
  }

  @action
  setIsBottomZone(value: boolean) {
    this.isBottomZone = value;
  }

  @action
  setInitialScroll(value: boolean) {
    this.initialScroll = value;
  }

  @action
  setScrollBottomTrigger(value: boolean) {
    this.scrollBottomTrigger = value;
  }

  @action
  setLoadingPrev(value: boolean) {
    this.isLoadingPrev = value;
  }

  @action
  setNewMessageCount(value: number) {
    this.newMessageCount = value;
  }

  @action
  async loadPrevMessages() {
    let topMessage = this.fireMessages[0];
    let prevMessages = await firechat.getPrevMessages(this.activeChat.id, topMessage.time, 25);
    this.updateFireMessages(prevMessages, topMessage);
  }

  @action
  async updateFireMessages(newData: any, topMessage?: any) {
    if (this.activeChat) {
      const formattedNewData = this.formatFireMessages(newData, topMessage);

      if (formattedNewData.length && this.fireMessages.length && !this.isLoadingPrev) {
        if (formattedNewData[formattedNewData.length - 1].id === this.fireMessages[this.fireMessages.length - 1].id) {
          return;
        }
      }

      if (this.isBottomZone && !this.isLoadingPrev && !this.initialScroll) {
        this.scrollBottomTrigger = true;
      }

      if (!formattedNewData[formattedNewData.length - 1].income && !this.isLoadingPrev && !this.initialScroll) {
        this.scrollBottomTrigger = true;
      }

      if (
        !this.isBottomZone &&
        !this.initialScroll &&
        !this.lastSeenMessage &&
        !this.isLoadingPrev &&
        this.fireMessages.length
      ) {
        this.setLastSeenMessage(this.fireMessages[this.fireMessages.length - 1]);
      }

      if (formattedNewData.length > 0) {
        if (this.fireMessages.length) {
          if (this.isLoadingPrev) {
            this.haveNext = formattedNewData.length >= 24; // Есть ли еще сообщения в коллекции?
            this.fireMessages = [...formattedNewData, ...this.fireMessages];
          } else {
            let equal = 0;
            let newMessages: any = [];

            // Обратное сканирование вновь пришедших сообщений
            // и текущих в поисках новых сообщений
            //                  <----
            //    [2, 3, 4, 5, 6, 7] - вновь пришедшие
            // [1, 2, 3, 4, 5] - старые сообщения

            // Алгоритм поиска новых сообщений выдал [6, 7]

            for (let index = 0; index <= 25; index++) {
              if (this.fireMessages.length - index - 1 >= 0 && !equal) {
                const old_message = this.fireMessages[this.fireMessages.length - index - 1];
                for (let j = formattedNewData.length; j >= 0; j--) {
                  const new_message = formattedNewData[j];
                  if (new_message && old_message) {
                    if (new_message.id === old_message.id) {
                      equal = j + 1;
                      break;
                    }
                    newMessages.push(new_message);
                  }
                }
              }
            }

            newMessages = [...this.fireMessages, ...newMessages];

            if (!this.isBottomZone && !this.scrollBottomTrigger && !this.initialScroll) {
              this.setNewsCount(newMessages.length);
            } else {
              chatStore.readAllMessages();
            }

            this.fireMessages = newMessages;
          }
        } else {
          this.fireMessages = formattedNewData;
          this.readAllMessages();
        }
      }
    }
  }

  setNewsCount(newMessagesLength: any) {
    let newCount = newMessagesLength - this.fireMessages.length;
    this.setNewMessageCount(newCount + this.newMessageCount);
  }

  @action
  updateFireChats(data: any) {
    const formattedChats = this.formatFireChats(data);
    this.chats = formattedChats;
    if (this.activeChat) {
      let target = this.chats.find((chat: any) => chat.id === this.activeChat.id);
      if (target.id !== this.activeChat.id) this.activeChat = target;
    }
  }

  formatFireChats(data: any) {
    if (!data) return [];
    let formattedChats: any = [];
    Object.keys(data).map((key: any) => {
      const chat_item = data[key];
      const chat: any = {
        id: key,
        users: chat_item.users,
        last_message: chat_item.last_message ? chat_item.last_message : null,
        unReadedCount: chat_item.unReadedCount ? chat_item.unReadedCount : 0,
        setActiveMessage(message: IMsg) {
          this.active_msg = message;
        },
        changeSocial(social: any) {
          this.activeSocial = social;
        },
      };
      formattedChats.push(chat);
    });
    return formattedChats;
  }

  async setActiveChatByChatId(chatId: string) {
    if (!!chatId) {
      if (this.activeChat && this.activeChat.id === chatId) {
        this.fireMessages = [];
        this.initialScroll = true;
        this.activeChat = null;
      } else {
        this.fireMessages = [];
        this.initialScroll = true;
        this.activeChat = this.chats.find((chat: any) => chat.id === chatId);
      }
    } else {
      this.activeChat = null;
    }
    this.loaded = true;
  }

  async setActiveChatByContactId(contactId: any) {
    // Найти контакт, и если что создать
    let targetChat = this.chats.find((chat: any) => Object.keys(chat.users).find((key: string) => key == contactId));
    if (targetChat) {
      this.fireMessages = [];

      if (this.activeChat && targetChat.id == this.activeChat.id) {
        this.activeChat = null;
      } else {
        this.activeChat = targetChat;
      }
    } else {
      await this.createFireChat(contactId);
    }
  }

  async createFireChat(contactId: any) {
    let users: any = {};

    users[userStore.hero.id] = 0;
    users[contactId] = 0;

    const chat: any = {
      users: users,
    };

    firechat.addChat(chat);
  }

  formatFireMessages(data: any, topMessage?: any) {
    if (!data) return [];
    let formattedMessages: any = [];
    let dataLenght = Object.keys(data).length - 1;
    Object.keys(data).map((key: any, index: number) => {
      if (!topMessage || key !== topMessage.id) {
        let msg = data[key];
        let messageItem = {
          avatar: msg.avatar,
          user: msg.username,
          content: msg.content,
          time: msg.time,
          id: key,
          cuid: msg.cuid,
          income: userStore.hero.id !== msg.cuid,
          readed: msg.readed,
        };
        if (index === dataLenght) messageItem["animation-lock"] = true;
        formattedMessages.push(messageItem);
      }
    });
    return formattedMessages;
  }

  @action
  editMessageLocaly(index: number, key: string, value: any) {
    let message = this.fireMessages[index];
    message[key] = value;
  }

  @action
  readAllMessages() {
    let updateArray: any = [];
    for (let i = this.fireMessages.length - 1; i >= 0; i--) {
      const message = this.fireMessages[i];
      if (message.income) {
        if (!message.readed) {
          updateArray[message.id + "/readed"] = true;
          this.editMessageLocaly(i, "readed", true);
        } else {
          break;
        }
      }
    }

    console.log("updateArray", updateArray);

    if (Object.keys(updateArray).length > 0) {
      firechat.editChat(this.activeChat.id, "users/" + userStore.hero.id, 0);
      firechat.editMessagesCascade(this.activeChat.id, updateArray);
    }
  }

  // Firebase actions news

  @action
  addPageNumber() {
    this.activeChatPageNumber += 1;
  }

  @action
  setPageNumber(number: number) {
    this.activeChatPageNumber = number;
  }

  @action
  getPageNumber() {
    return this.activeChatPageNumber;
  }

  @action
  setPageLoading(pageLoading: boolean) {
    this.pageLoading = pageLoading;
  }

  @action
  async sendMessage(message: string, conversationSourceAccountId: any, school: any, files: any) {
    await sendMessage(this.activeChat.id, message, conversationSourceAccountId, school, files);
  }

  @action
  async loadMessages(contact_id: string, pageNum?: number) {
    if (this.pageLoading) {
      return null;
    }

    let messages: IMsg[][] = [];
    this.setPageLoading(true);

    // загружаем пачки сообщений постранично
    for (let i = 1; i <= pageNum; i++) {
      const pageArray: IMsg[] = [];

      let message_list = await getMessages(contact_id, i, appStore.school);

      if (message_list.length === 0) {
        break;
      }

      // обработка пачки сообщений
      for (let j = 0; j < message_list.length; j++) {
        const message = this.collectMessage(
          {
            previous: message_list[j - 1],
            current: message_list[j],
            next: message_list[j + 1],
          },
          contact_id
        );

        pageArray.unshift(message);
      }

      messages.unshift(pageArray);
    }

    // если находимся в чате
    if (this.activeChat && this.activeChat.msg) {
      this.activeChat.setMessages(messages);

      if (document.querySelector(`.page-${this.getPageNumber()}`)) {
        if (this.activeChat.msg[0].length > 29) {
          setTimeout(() => {
            $(".msg_space").animate({ scrollTop: $(`.page-1`).height() }, 0);
          });
        }

        this.addPageNumber();
      }

      this.setPageLoading(false);
    } else {
      this.setPageLoading(false);

      return messages;
    }

    return null;
  }

  @action
  getMsg(id: string, chat_id: string): IMsg {
    let chat = this.chats.find((chat_item: IChat) => chat_item.id === chat_id);
    for (let i = chat.msg.length; i >= 0; i--) {
      let page = chat.msg[i];
      return page.find((msg: IMsg) => msg.id === id);
    }
    return null;
  }

  @action
  getChat_contactId(contact_id: string): IChat {
    return this.chats.find((chat_item: IChat) => chat_item.contact_id === contact_id);
  }

  @action
  getChat(id: string): IChat {
    return this.chats.find((chat_item: IChat) => chat_item.id === id);
  }

  @action
  setModalWindow(status: string) {
    this.modalWindow = status;
  }

  @action
  getLastMsg(id: string): any {
    let chat = this.getChat_contactId(id);

    return chat.msg[chat.msg.length - 1];
  }

  @action
  async addMsg(content: any, from: any, social_media: string, reply: any) {
    if (this.activeChat) {
      let id = "msg_" + Math.random();
      contactStore.setLastMsg(this.activeChat.contact_id, `msg_${id}`);
      let avatar = userStore.hero.avatar;
      let time = moment().format("HH:mm");
      let date = moment().format("DD.MM");
      let firstPage = this.activeChat.msg[0];
      let prevMsg = firstPage[firstPage.length - 1];

      let flowMsgNext = false;
      let flowMsgPrev = false;
      let center = false;

      let time_scope: any = null;

      let currentTime = moment(time, "HH:mm");
      let prevTime = moment(prevMsg.time, "HH:mm");
      let prevTimeDiff = currentTime.diff(prevTime, "minutes");

      if (prevMsg && prevMsg.date !== date) {
        time_scope = prevMsg.date;
      } else {
        time_scope = null;
      }

      if (prevTimeDiff < 3) {
        prevMsg.flowMsgNext = true;
        flowMsgPrev = true;
      }

      let msg: IMsg = {
        flowMsgNext,
        flowMsgPrev,
        center,
        time,
        date,
        time_scope,
        id: `msg_${id}`,
        avatar: avatar,
        from: from,
        social_media: social_media,
        content: content,
        readed: false,
        smiles: [],
        reply: reply,
        edited: false,
        income: false,
        readMsg() {
          this.readed = true;
        },
        addSmile(smile) {
          this.smiles.push(smile);
        },
        editMsg(value: string) {
          this.content = value;
          this.edited = true;
        },
      };

      this.activeChat.msg[0].push(msg);
      setTimeout(() => {
        $(".msg_space").animate({ scrollTop: $(".msg_space").prop("scrollHeight") }, 0);
      });
    }
  }

  @action
  deleteMsg(id: string, chat_id: string) {
    for (let i = 0; i < this.chats.length; i++) {
      let chat = this.chats[i];

      if (chat.id === chat_id) {
        chat.msg = chat.msg.filter((msg: any) => msg.id !== id);
      }

      this.chats[i] = chat;
    }
  }

  @action
  setActiveMsg(message: IMsg, chat_id: string) {
    let chat = this.chats.find((chat_item: IChat) => chat_item.id === chat_id);

    if (message) {
      this.activeMsg = message;
      chat.setActiveMsg(message);
    } else {
      this.activeMsg = null;
      chat.setActiveMsg(null);
    }
  }

  // @action
  // readAllMsg(chat_id: string) {
  //     let chat = this.chat.find((chat_item: IChat) => chat_item.id === chat_id)
  //     for (let i = chat.msg.length; i > 0; i--) {
  //         const msg = chat.msg[i - 1];
  //         if (msg.readed) {
  //             break;
  //         } else {
  //             msg.read()
  //         }
  //     }
  //     contactStore.setStatus(chat.contact_id, 'readed')
  // }

  collectMessage(message: any, contact_id: string) {
    let avatar = message.current.income ? contactStore.getAvatar(contact_id) : userStore.hero.avatar;
    let userId = message.current.from;
    let previousMessage, nextMessage: any;
    let previousTimeDifference, nextTimeDifference: any;
    let flowMessageNext = false;
    let flowMessagePrevious = false;
    let center = false;
    let previousRead, timeScope: any;
    let username: string;
    let type = "message";

    if (contactStore.activeContact.user.find((u: any) => u == message.current.from)) {
      username = contactStore.activeContact.name;
    }

    if (message.previous) {
      previousMessage = message.previous;
      previousRead = previousMessage.readed;
      let currentTime = moment(message.current.time, "HH:mm");
      let prevTime = moment(previousMessage.time, "HH:mm");
      previousTimeDifference = prevTime.diff(currentTime, "minutes");
    }

    if (message.next) {
      nextMessage = message.next;
      let currentTime = moment(message.next.time, "HH:mm");
      let nextTime = moment(nextMessage.time, "HH:mm");
      nextTimeDifference = currentTime.diff(nextTime, "minutes");
    }

    if (previousMessage && previousMessage.date !== message.current.date) {
      timeScope = message.current.date;
    } else {
      timeScope = null;
    }

    if (
      previousMessage &&
      previousMessage.income === message.current.income &&
      previousMessage.from === userId &&
      previousTimeDifference < 3
    ) {
      flowMessageNext = true;
    }

    if (
      nextMessage &&
      nextMessage.income === message.current.income &&
      nextMessage.from === userId &&
      nextTimeDifference < 3
    ) {
      flowMessagePrevious = true;
    }

    if (flowMessageNext && flowMessagePrevious) {
      center = true;
    }

    return {
      timeScope,
      previousRead,
      flowMessageNext,
      flowMessagePrevious,
      center,
      avatar,
      username,
      type,
      ...message.current,
      readMsg() {
        this.readed = true;
      },
      addSmile(smile: any) {
        this.smiles.push(smile);
      },
      editMsg(msg: string) {
        this.content = msg;
        this.editted = true;
      },
    };
  }
}

export const chatStore = new ChatStore();
