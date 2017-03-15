'use strict';

const Command = require('../../Command.js');

const UserEmotes = require('../../resources/UserEmotes.js');

class UserSpecificEmote extends Command {
    /**
     * @param {Cephalon} bot
     */
    constructor(bot) {
        super(bot, 'core.userSpecificEmote', 'userSpecificEmote');

        var regex = '^(';
        for(var i = 0; i < UserEmotes.length; i++) {
            regex += UserEmotes[i].call;
            if(i !== UserEmotes.length - 1) {
                regex += '|';
            }
        }
        regex += ')$';
        this.regex = new RegExp(regex, 'i');
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        let emote = UserEmotes.find((x) => { return message.cleanContent.match(x.call); });

        if(emote.isSimple) {
            this.executeSimpleEmote(emote, message);
        } else {
            emote.function(message.author.id).then((content) => {
                this.bot.messageManager.sendMessage(message, content);
            });
        }
    }

    /**
     * @param {Object} emote 
     * @param {Message} message 
     */
    executeSimpleEmote(emote, message) {
        if(message.author.id === emote.user) {
            this.bot.messageManager.sendMessage(message, emote.content);
        } else {
            this.bot.messageManager.sendMessage(message, 'This command is restricted to a specific user');
        }
    }
}

module.exports = UserSpecificEmote;