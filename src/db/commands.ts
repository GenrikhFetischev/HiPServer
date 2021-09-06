import { Contact, Message, MessageStatus } from "../types";

export const createTablesCommand = `
CREATE TABLE IF NOT EXISTS contacts (
   socket        varchar(50)    primary key not null ,
   created       timestamp      not null default now(),
   port          int,
   name          varchar(200),
   ip            varchar(50)
);


CREATE TABLE IF NOT EXISTS messages (
  id             uuid           primary key default gen_random_uuid (),
  status         int8           default 0, 
  timestamp      int            not null,
  messageId      int            not  null,
  "from"         varchar(50)    references "contacts"(socket),
  "to"           varchar(50)    references "contacts"(socket),
  text           varchar
)
`;

export const createMeContactCommand = `
  insert into contacts (socket,  port, name, ip)
  values ('me', 0, 'me', 'me' ) 
  on conflict do nothing 
`;

export const buildUpsertContactQuery = ({ port, name, ip }: Contact) => `
  insert into contacts (socket, ip, port, name)
  values ('${ip}:${port}', '${ip}', ${port}, '${name}')
  on conflict (socket) do update set 
  port = ${port},
  ip = '${ip}',
  socket = '${ip}:${port}',
  name = '${name}'
`;

export const buildDeleteContactQuery = ({ ip, port }: Contact) => `
  delete from "contacts" where socket = '${ip}:${port}'
`;

export const buildInsertMessageQuery = ({
  from,
  to,
  timestamp,
  content,
  status = MessageStatus.Sent,
}: Message) => `
  insert into messages ("from", "to", text, timestamp, status)
  values ('${from}', '${to}', '${content.text}', ${timestamp}, ${status});
`;

export const buildGetMessagesForClientQuery = (contact: Contact) => {
  const socket = `${contact.ip}:${contact.port}`;

  return `
    select from messages where 
    "from" = '${socket}' or 
    "to" = '${socket}' order by timestamp                       
  `;
};

export const buildSetMessageStatusCommand = (
  timestamp: number,
  status: MessageStatus
) => `
    update messages set status = ${status} where timestamp = ${timestamp}
`;
