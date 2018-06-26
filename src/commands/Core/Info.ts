import Command from "../../objects/Command";
import * as os from "os";
import { exec } from "child_process";
import { version } from "discord.js";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

class Info extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.debug.info', 'info', 'Returns info about the current instance.');

        this.regex = /^(?:info|debug|session|vars)$'/i;

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent) {
        this.bot.db.getVersion().then((mySQLVersion: string) => {
            new Promise((resolve) => {
                exec('git rev-parse --short=7 HEAD', (error, stdout) => {
                    resolve(stdout);
                });
            }).then((gitHash: string) => {
                let str = `Platform: ${os.type()}${process.arch}`;
                str += `\nCPUs: ${os.cpus().length}`;
                str += `\nBot version: ${gitHash}`;
                str += `\nDiscord.js version: ${version}`;
                str += `\n\nNode.js version: ${process.versions.node}`;
                str += `\nV8 version: ${process.versions.v8}`;
                str += `\n\nMySQL Version: ${mySQLVersion}`;
                str += `\nMySQL Host: ${process.env.MYSQL_HOST}`;
                str += `\nMySQL Port: ${process.env.MYSQL_PORT}`;
                str += `\nMySQL Database: ${process.env.MYSQL_DB}`;

                message.channel.send(str);
            });
        });
    }
}

module.exports = Info;