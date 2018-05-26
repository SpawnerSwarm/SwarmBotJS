'use strict';

const Command = require('../../Command.js');
const os = require('os');
const exec = require('child_process').exec;
const Discord = require('discord.js');

class Info extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'core.debug.info', 'info', 'Returns info about the current instance.');

        this.regex = new RegExp('^(?:info|debug|session|vars)$');

        this.requiredRank = 0;
    }

    run(message) {
        this.bot.settings.getVersion().then((mySQLVersion) => {
            new Promise((resolve) => {
                exec('git rev-parse --short=7 HEAD', (error, stdout) => {
                    resolve(stdout);
                });
            }).then((gitHash) => {
                let str = `Platform: ${os.type()}${process.arch}`;
                str += `\nCPUs: ${os.cpus().length}`;
                str += `\nBot version: ${gitHash}`;
                str += `\nDiscord.js version: ${Discord.version}`;
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