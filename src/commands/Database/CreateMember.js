'use strict';

const Command = require('../../Command.js');

const Ranks = require('../../resources/Ranks.js');

class CreateMember extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'database.createMember', 'createMember');

        this.regex = new RegExp('^(?:createMember|member create) <@!?(\\d+)>$', 'i');

        this.allowDM = false;

        this.requiredRank = 4;
    }

    run(message) {
        const messageMatch = message.strippedContent.match(this.regex, 'i');
        if (!messageMatch[1]) {
            message.channel.sendMessage('Syntax incorrect');
        } else {
            /**
             * @type {Boolean}
             */
            this.bot.settings.getMember(messageMatch[1]).then(() => {
                message.channel.sendMessage('Member already exists');
                return;
            }).catch((err) => {
                if (err == 'Member not found') {
                    message.guild.fetchMember(messageMatch[1]).then((member) => {
                        this.bot.settings.createMember(messageMatch[1], member.user.username);
                        message.channel.sendMessage('Member created');
                    });
                } else {
                    message.channel.sendMessage(message, `\`Error: ${err}\``);
                }
            });
        }
    }
}

module.exports = CreateMember;