import { Snowflake } from "discord.js";
import Cephalon from "../Cephalon";
import { RankNum } from "./Types";

export default class Member {
    public readonly ID: Snowflake;
    public readonly Name: string;
    public readonly Rank: RankNum;
    private bot: Cephalon;

    private _wfname: string;
    public get WarframeName(): string {
        return this._wfname;
    }
    public set WarframeName(wfname: string) {
        this.bot.db.updateWF(this.ID, wfname);
    }

    private _skname: string;
    public get SpiralKnightsName(): string {
        return this._skname;
    }
    public set SpiralKnightsName(skname: string) {
        this.bot.db.updateSK(this.ID, skname);
    }

    public readonly LastPestered: Date;

    public readonly LastPesteredIndex: number;

    private _ally: 1 | 0;
    public get Ally(): boolean {
        return Boolean(this._ally);
    }

    private _banned: 1 | 0;
    public get Banned(): boolean {
        return Boolean(this._banned);
    }
    public set Banned(banned: boolean) {
        this.bot.db.setBanned(this.ID, banned ? 1 : 0);
    }

    public constructor(
        bot: Cephalon,
        id: Snowflake,
        name: string,
        rank: RankNum,
        wfname: string,
        skname: string,
        lastPestered: Date,
        lastPesteredIndex: number,
        ally: 1 | 0,
        banned: 1 | 0
    ) {
        this.bot = bot;

        this.ID = id;
        this.Name = name;
        this.Rank = rank;
        this._wfname = wfname;
        this._skname = skname;
        this.LastPestered = lastPestered;
        this.LastPesteredIndex = lastPesteredIndex;
        this._ally = ally;
        this._banned = banned;
    }
}