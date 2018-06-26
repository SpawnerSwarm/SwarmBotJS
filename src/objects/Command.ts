﻿import Cephalon from "../Cephalon";
import Logger from "../helpers/Logger";
import CommandHandler from "../helpers/CommandHandler";
import { MessageWithStrippedContent, RankNum } from "../objects/Types.d";

export default class Command {
    protected bot: Cephalon;
    protected get logger(): Logger {
        return this.bot.logger;
    }
    protected get ch(): CommandHandler {
        return this.bot.ch;
    }

    public id: string;
    public call: string;
    public description: string;
    public regex: RegExp;
    public usages: {
        description?: string,
        parameters: string[]
    }[];
    public ownerOnly: boolean = false;
    public requiredRank: RankNum;
    public allowDM: boolean = true;

    public mandatoryWords: RegExp | undefined = undefined;

    constructor(bot: Cephalon, id: string, call: string, description?: string) {
        this.id = id;
        this.call = call;

        this.regex = new RegExp(`^${call}s?$`, 'i');

        this.usages = [
            { description, parameters: [] },
        ];

        this.bot = bot;

        this.requiredRank = 1;
    }

    public run(message: MessageWithStrippedContent): void {
        message.reply('This is a basic Command')
            .then((msg) => {
                this.logger.debug(`Sent ${msg}`);
            })
            .catch((error) => this.logger.error(`Error: ${error}`));
    }

    protected _tsoverrideregex(match: RegExpMatchArray | null): match is RegExpMatchArray {
        return true;
    }
}