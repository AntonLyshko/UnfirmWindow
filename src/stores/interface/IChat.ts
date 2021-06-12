import IMsg from "./IMsg";
import IRole from "./IRole";

export default interface IChat {
  users: {};
  contact_id: string;
  active_msg: any;
  id: string;
  user: string[];
  role: IRole[];
  msg: IMsg[][];
  activeSocial: string;
  setActiveMsg: (msg: IMsg) => void;
  changeSocial: (social: string) => void;
  setMessages: (messages: IMsg[][]) => void;
}
