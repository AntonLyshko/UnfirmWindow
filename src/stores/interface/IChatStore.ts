import IChat from "./IChat";
import IMsg from "./IMsg";

export default interface IChatStore {
  newMessagesAllHeight: number;
  chats: IChat[];
  activeChat: IChat;
  activeMsg: IMsg;
  modalWindow: string;
  loaded: boolean;
  activeChatPageNumber: number;
  pageLoading: boolean;
  fireMessages: IMsg[];
  isLoadingPrev: boolean;
  haveNext: boolean;
  newMessageCount: any;
  scrollBottomTrigger: boolean;
  initialScroll: boolean;
  isBottom: boolean;
  isBottomZone: boolean;
  lastSeenMessage: any;
  triggerClearTimer: boolean;

  setIsBottomZone: (value: boolean) => void;
  toggleUnreadDivider: (messageIndex: number) => void;
  loadPrevMessages: () => void;
  setActiveChatByContactId: (id: any) => void;
  setActiveChatByChatId: (id: any) => void;
  updateFireChats: (arg0: any) => void;
  setNewMessageCount: (value: number) => void;
  readAllMessages: () => void;
  setLoadingPrev: (arg0: boolean) => void;
  updateFireMessages: (newData: any, topMessage?: any) => void;
  addPageNumber: () => void;
  setPageNumber: (number: number) => void;
  getPageNumber: () => number;
  updateMessages: (contact_id: string) => any;
  loadMessages: (contact_id: string, pageNumber?: number) => void;
  setModalWindow: (status: string) => void;
  readAllMsg: (id: string) => void;
  setActiveMsg: (msg: IMsg, chat_id: string) => void;
  addMsg: (content: any, from: any, social_media: string, status: string) => void;
  sendMessage: (message: string, conversationSourceAccountId: any, school: any, files: any) => void;
  getMsg: (id: string, chat_id: string) => IMsg;
  getLastMsg: (id: string) => IMsg;
  changeSocial: (social: string) => void;
  getChat: (id: string) => IChat;
  deleteMsg: (id: string, chat_id: string) => void;
  setIsBottom: (value: boolean) => void;
  setInitialScroll: (value: boolean) => void;
  setScrollBottomTrigger: (value: boolean) => void;
  setLastSeenMessage: (value: any) => void;
}