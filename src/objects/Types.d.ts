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

export type MissionReward = {
    items: string[],
    countedItems: {
        count: number,
        type: string
    }[],
    credits: number,
    asString: string,
    itemString: string,
    thumbnail: UrlResolvable,
    color: number
}

export type AlertMission = {
    node: string,
    type: string,
    faction: string,
    reward: MissionReward,
    minEnemyLevel: number,
    maxEnemyLevel: number,
    nightmare: boolean,
    archwingRequired: boolean
}

export type Alert = {
    mission: AlertMission,
    expired: boolean,
    eta: string,
    rewardTypes: string[]
}

export type SortieMission = {
    missionType: string,
    modifier: string,
    modifierDescription: string,
    node: string
}

export type Sortie = {
    id: string,
    activation: string,
    expiry: string,
    rewardPool: string,
    variants: SortieMission,
    boss: string,
    faction: string,
    expired: boolean,
    eta: string
}

export type Fissure = {
    id: string,
    node: string,
    missionType: string,
    enemy: string,
    tier: string,
    tierNum: number,
    activation: string,
    expiry: string,
    expired: boolean,
    eta: string
}

export type VoidTraderInventory = {
    item: string,
    ducats: number,
    credits: number
}

export type VoidTraderInstance = {
    id: string,
    activation: string,
    expiry: string,
    inventory: VoidTraderInventory[],
    psId: string,
    active: boolean,
    startString: string,
    endString: string
}

export type CetusCycle = {
    id: string,
    expiry: string,
    isDay: boolean,
    timeLeft: string,
    isCetus: boolean,
    shortString: string
}