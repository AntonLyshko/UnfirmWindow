import IContact from "./IContact";

export default interface IContactStore {
  updateFireContacts: (arg0: any) => void;
  fireContacts: any;
  activeChat: any;
  contactLoading: boolean;
  contact: IContact[];
  activeContact: IContact;
  name: string;
  sources: any;
  search: string;
  filterSwitch: boolean;
  readonly availableContacts?: IContact[] | null;
  setActiveChat: (contact: any) => void;
  loadContact: () => void;
  filterSocial: (key: string) => void;
  toggleFilterSwitch: () => void;
  getContact: (id: string) => IContact;
  setActiveContact: (id: string) => void;
  setSearch: (id: string) => void;
  setStatus: (id: string, status: string) => void;
  init: (data: any) => void;

  getBuddyContact: (activeChat: any) => any;
}
