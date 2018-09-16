import Command from "../../objects/Command";
import * as os from "os";
import { exec } from "child_process";
import { version as discordVersion } from "discord.js";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Info extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.debug.info', 'info', 'Returns info about the current instance.');

        this.regex = /^(?:info|debug|session|vars)$/i;

        this.requiredRank = 0;
    }

    async run(message: MessageWithStrippedContent) {
        const mySQLVersion: string = await this.bot.db.getVersion();
        const version: string = require('../../package.json').version;
        let str = `Platform: ${os.type()}${process.arch}`;
        str += `\nCPUs: ${os.cpus().length}`;
        str += `\nBot version: ${version}`;
        str += `\nDiscord.js version: ${discordVersion}`;
        str += `\n\nNode.js version: ${process.versions.node}`;
        str += `\nV8 version: ${process.versions.v8}`;
        str += `\n\nMySQL Version: ${mySQLVersion}`;
        str += `\nMySQL Host: ${process.env.MYSQL_HOST}`;
        str += `\nMySQL Port: ${process.env.MYSQL_PORT}`;
        str += `\nMySQL Database: ${process.env.MYSQL_DB}`;
        await message.channel.send(str);
        return true;
    }
}