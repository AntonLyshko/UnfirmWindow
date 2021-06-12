import { action, computed, observable, reaction } from "mobx";
import { IContactStore, IContact, IMsg } from "@stores/interface";
import { chatStore, appStore, userStore } from "@stores/implementation";
import { getConversations } from "@actions";
import { firechat } from "@stores/implementation/Firebase/firebase";
import $ from "jquery";

export class ContactStore implements IContactStore {
  @observable fireContacts: IContact[] = [];
  @observable contact: IContact[] = [];
  @observable activeContact: IContact;
  @observable search: string = "";
  @observable filterSwitch: boolean = false;
  @observable sources: any = {
    whatsapp: false,
    instagram: false,
    vkontakte: true,
    odnoklassniki: true,
    viber: false,
    facebook: false,
    telegram: true,
    email: false,
  };
  contactLoading: boolean = false;

  // Firebase news
  @observable limit: number = 50;
  @observable isLoadingPrev: boolean = false;
  @observable haveNext: boolean = false;
  activeChat: any;
  loaded: boolean;

  constructor() {
    reaction(
      () => {
        return this.contact;
      },
      () => {}
    );
  }
  filter: any;
  name: string;

  @action
  async updateFireContacts(newData: any, topMessage?: any) {
    const formattedNewData = this.formatFireContact(newData, topMessage);

    this.fireContacts = formattedNewData;
    // if (formattedNewData.length > 0) {
    //   if (formattedNewData.length > 48) this.haveNext = true;

    //   if (this.fireContacts.length) {
    //     let equal = 0;
    //     let newContacts: any = [];

    //     for (let index = 0; index <= 50; index++) {
    //       if (this.fireContacts.length - index - 1 >= 0 && !equal) {
    //         const old_message = this.fireContacts[this.fireContacts.length - index - 1];
    //         for (let j = formattedNewData.length; j >= 0; j--) {
    //           const new_message = formattedNewData[j];
    //           if (new_message && old_message) {
    //             if (new_message.id === old_message.id) {
    //               equal = j + 1;
    //               break;
    //             }
    //             newContacts.push(new_message);
    //           }
    //         }
    //       }
    //     }

    //     newContacts = [...this.fireContacts, ...newContacts];
    //     this.fireContacts = newContacts;
    //   } else {
    //     this.fireContacts = formattedNewData;
    //   }
    // }
  }

  formatFireContact(data: any, topMessage?: any) {
    if (!data) return [];
    let formattedContacts: any = [];

    Object.keys(data).map((key: string) => {
      let contact_item = data[key];

      const initContact: IContact = {
        key,
        ...contact_item,
        setStatus(status: string) {
          this.status = status;
        },
        setLastMsg(message_id: string) {
          this.last_message_id = message_id;
        },
      };

      formattedContacts.push(initContact);
    });
    return formattedContacts;
  }

  async setActiveChat(contact: any) {
    console.log("setActiveChat");
    if (!!contact) {
      this.activeChat = await this.collectChat(contact);
    } else {
      this.activeChat = null;
    }
    this.loaded = true;
  }

  async collectChat(contact: any) {
    const chat: any = {
      contact_id: contact.id,
      id: contact.id,
      activeSocial: contact.last_message.social_media,
      role: [],
      msg: [],
      user: contact.user,
      active_msg: null,
      setActiveMsg(message: IMsg) {
        this.active_msg = message;
      },
      changeSocial(social: any) {
        this.activeSocial = social;
      },
      setMessages(messages: IMsg[][]) {
        this.msg = messages;
      },
    };

    return chat;
  }

  async writeContact(avatar: string, username: string, id: string) {
    let target = this.fireContacts.find((c) => c.id === id);
    if (!target) {
      let newContact: any = {
        avatar,
        name: username,
        id,
        last_message: null,
        status: "read",
      };
      firechat.addContact(newContact);
    }
  }

  // Old shit

  @computed
  get availableContacts() {
    return this.contact;
  }

  @action
  toggleFilterSwitch() {
    this.filterSwitch = !this.filterSwitch;
  }

  @action
  filterSocial(key: string) {
    this.sources[key] = !this.sources[key];
    this.contact = [];
    appStore.setLoading(false);
    appStore.updateContact();
  }

  @action
  setSearch(search: string) {
    this.search = search;
    this.contact = [];
    appStore.setLoading(false);
    appStore.updateContact();
  }

  @action
  async loadContact(): Promise<any> {
    if (this.contactLoading) {
      return null;
    }

    this.contactLoading = true;

    let conversations = await getConversations(appStore.school, appStore.activeContactPageNumber + 1);

    let dataContact: any = [];
    if (!!conversations.length) {
      for (let i = 0; i < conversations.length; i++) {
        const contact_item = conversations[i];
        const initContact: IContact = {
          ...contact_item,
          setStatus(status: string) {
            this.status = status;
          },
          setLastMsg(message_id: string) {
            this.last_message_id = message_id;
          },
        };

        dataContact.push(initContact);
      }

      this.contact = [...this.contact, ...dataContact];

      if (conversations.length === 20) {
        setTimeout(() => {
          appStore.setContactPageNumber(appStore.activeContactPageNumber + 1);

          this.contactLoading = false;
        }, 500);
      }
    } else {
      this.contactLoading = false;
    }
  }

  @action
  deleteName = () => "";

  @action
  async getBuddyContact(chat: any) {
    let usersArray: any = [];
    Object.keys(chat.users).map((key) => usersArray.push(key));
    let buddy = await usersArray.map((key: any) => {
      const userContact = this.getContact(key);
      if (userContact && key != userStore.hero.id && !userContact["role"]) return userContact;
      return null;
    });
    buddy = buddy.find((buddy: any) => !!buddy);
    return buddy;
  }

  @action
  getContact(id: any) {
    return this.fireContacts.find((contact_item: IContact) => contact_item.id == id);
  }

  @action
  setLastMsg(id: string, message_id: string) {
    let contact = this.getContact(id);
    contact.setLastMsg(message_id);
  }

  @action
  setStatus(id: string, status: string) {
    let contact = this.getContact(id);

    contact.setStatus(status);
  }

  @action
  async setActiveContact(id: string) {
    chatStore.setPageNumber(1);
    if (!this.activeContact) {
      this.activeContact = null;
      return;
    }

    if (this.activeContact.id === id) {
      this.activeContact = null;
    } else {
      chatStore.loaded = false;
      this.activeContact = this.fireContacts.find((contact) => contact.id === id);
      chatStore.setActiveChat(this.activeContact);
      // await chatStore.init(this.activeContact)
    }
  }

  @action
  getAvatar(id: string) {
    let contact = this.getContact(id);

    return contact.avatar;
  }

  @action
  async init(data: any) {
    const dataContact = [];

    if (!data.length) {
      this.contact = [];
      appStore.setLoading(true);
      return;
    }

    for (let i = 0; i < data.length; i++) {
      const contact_item = data[i];
      const initContact: IContact = {
        ...contact_item,
        setStatus(status: string) {
          this.status = status;
        },
        setLastMsg(message_id: string) {
          this.last_message_id = message_id;
        },
      };

      dataContact.push(initContact);
    }

    if (JSON.stringify(this.contact) !== JSON.stringify(dataContact)) {
      for (let i = 0; i < this.contact.length; i++) {
        const localContact = this.contact[i];

        let serverContact = dataContact[i];
        if (!serverContact) {
          continue;
        }

        // Проверка на последнее сообщение, если оно не соответствует старому - загрузить новые сообщения
        if (this.activeContact && this.activeContact.id === localContact.id) {
          if (localContact.last_message.id !== serverContact.last_message.id) {
            await chatStore.loadMessages(this.activeContact.id, 1);

            setTimeout(() => {
              $(".msg_space").animate({ scrollTop: $(".msg_space").prop("scrollHeight") }, 0);
            });
          }
        }
      }

      if (this.contact.length) {
        // Замена первых 20 контактов
        for (let i = 0; i <= 19; i++) {
          this.contact[i] = dataContact[i];
        }
      } else {
        this.contact = dataContact;
      }
    }

    appStore.setLoading(true);
  }
}

export const contactStore = new ContactStore();
