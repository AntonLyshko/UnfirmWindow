import { action, observable, reaction } from "mobx";
import { IUserStore, IUser } from "@stores/interface";
import { getUserData } from "@actions";
import { contactStore } from "@stores/implementation";

export class UserStore implements IUserStore {
  @observable hero: IUser;
  @observable availableUsers: IUser[] = [];

  constructor() {
    reaction(
      () => {
        return this.availableUsers;
      },
      () => {}
    );
  }

  @action
  async initHero() {
    this.hero = await getUserData();
    contactStore.writeContact(this.hero.avatar, this.hero.username, this.hero.id);
  }
}

export const userStore = new UserStore();
