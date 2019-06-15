import { RankNum } from "./Types";
import { Snowflake } from "discord.js";

export default class Emote {
    public Name: string;
    public Content: string;
    public Reference: string;
    public Rank: RankNum;
    public Creator: Snowflake;
}