import { User } from "./types";

export class Contacts {
  private contacts: Map<string, User>;

  constructor(contacts: User[]) {
    this.contacts = new Map(
      contacts.map((contact) => [contact.networkAddress, contact])
    );
  }

  public isUserContact = (user: User): boolean =>
    this.contacts.has(user.networkAddress);

}
