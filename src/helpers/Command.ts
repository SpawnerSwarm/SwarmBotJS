import Cephalon from "../Cephalon";
import Logger from "./Logger";
import CommandHandler from "./CommandHandler";
import { Message } from "discord.js";
import { MessageWithStrippedContent } from "../objects/Types";

export default class Command {
    private bot: Cephalon;
    private get logger():Logger {
        return this.bot.logger;
    }
    private get ch():CommandHandler {
        return this.bot.ch;
    }

    public id: string;
    public call: string;
    public description: string;
    public regex: RegExp;
    public usages: {
        description: string,
        parameters: string[]
    }[];
    public ownerOnly: boolean = false;
    public requiredRank: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    public allowDM: boolean = true;

    constructor(bot: Cephalon, id: string, call: string, description: string) {
        this.id = id;
        this.call = call;

        this.regex = new RegExp(`^${call}s?$`, 'i');

        this.usages = [
            { description, parameters: [] },
        ];

        this.bot = bot;

        this.requiredRank = 1;
    }

    run(message: MessageWithStrippedContent) {
        message.reply('This is a basic Command')
            .then((msg) => {
                this.logger.debug(`Sent ${msg}`);
            })
            .catch((error) => this.logger.error(`Error: ${error}`));
    }
}