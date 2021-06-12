import IAppStore from "@stores/interface/app/IAppStore";
import IUserStore from "@stores/interface/IUserStore";
import IChatStore from "@stores/interface/IChatStore";
import IContactStore from "@stores/interface/IContactStore";
import IContact from "@stores/interface/IContact";
import IChat from "@stores/interface/IChat";
import IMsg from "@stores/interface/IMsg";
import IUser from "@stores/interface/IUser";
import IAuthStore from "@stores/interface/app/IAuthStore";
import IFirebase from "@stores/interface/IFirebase";

export { IUser, IContact, IChat, IMsg, IUserStore, IAppStore, IChatStore, IContactStore, IAuthStore, IFirebase };

/** Наименования строго в camelCase, без префикса I */
export default interface IStores {
  contactStore: IContactStore;
  userStore: IUserStore;
  chatStore: IChatStore;
  appStore: IAppStore;
  authStore: IAuthStore;
}
