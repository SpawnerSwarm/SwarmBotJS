import { Url, UrlObject } from "url";
import { Snowflake, TextChannel, GuildChannel, Message } from "discord.js";

export type Falsey = '' | '0' | 0 | 'false' | false | null | undefined;
export type Truthy = 1 | '1' | 'true' | true;

export type UrlResolvable = string | Url | UrlObject;

export type GuildTextChannel = GuildChannel & TextChannel;

export interface MessageWithStrippedContent extends Message {
    strippedContent: string;
}

export type RankNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;