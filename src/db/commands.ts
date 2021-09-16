import { Contact, Message, MessageStatus } from "../types";

export const createTablesCommand = `
    CREATE TABLE IF NOT EXISTS contacts
    (
        id      uuid                    not null default gen_random_uuid(),
        host    varchar(50) primary key not null,
        created timestamp               not null default now(),
        name    varchar(200)
    );


    CREATE TABLE IF NOT EXISTS messages
    (
        id        uuid primary key default gen_random_uuid(),
        status    int8             default 0,
        timestamp bigint      not null,
        messageId varchar(50) not null,
        "from"    varchar(50) references "contacts" (host),
        "to"      varchar(50) references "contacts" (host),
        text      varchar
    )
`;

export const createMeContactCommand = `
    insert into contacts (host, name)
    values ('me', 'me')
    on conflict do nothing
`;

export const getContactsQuery = `
    select *
    from contacts;
`;

export const buildUpsertContactQuery = ({ name, host }: Contact) => `
    insert into contacts (host, name)
    values ('${host}', '${name}')
    on conflict (host) do update set host = '${host}',
                                     name = '${name}'
`;

export const buildDeleteContactQuery = ({ host }: Contact) => `
    delete
    from contacts
    where host = '${host}'
`;

export const buildInsertMessageQuery = ({
  from,
  to,
  timestamp,
  content,
  status = MessageStatus.Sent,
  messageId,
}: Message) => `
    insert into messages ("from", "to", text, timestamp, status, messageId)
    values ('${from}', '${to}', '${content.text}', ${timestamp}, ${status}, '${messageId}');
`;

export const buildGetMessagesForClientQuery = (host: string) => {
  return `
      select *
      from messages
      where "from" = '${host}'
         or "to" = '${host}'
      order by timestamp
  `;
};

export const buildSetMessageStatusCommand = (
  messageId: string,
  status: MessageStatus
) => `
    update messages
    set status = ${status}
    where messageId = '${messageId}'
`;
