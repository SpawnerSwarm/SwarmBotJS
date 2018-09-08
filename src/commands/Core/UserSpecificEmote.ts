import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { simple, UserEmotes, ComplexUserEmote, SimpleUserEmote } from "../../objects/UserEmotes.on";
import { MessageWithStrippedContent } from "../../objects/Types";
import { Message } from "discord.js";

export default class UserSpecificEmote extends Command {
    constructor(bot: Cephalon) {
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

        this.requiredRank = 0;
    }

    run(message: MessageWithStrippedContent): void {
        let emote = UserEmotes.find(x => message.cleanContent.match(x.call) ? true : false);

        if(emote) {
            if(simple(emote)) {
                this.executeSimpleEmote(emote, message);
            } else {
                (emote as ComplexUserEmote).function(message.author.id).then((content) => {
                    message.channel.send(content);
                });
            }
        }
    }

    executeSimpleEmote(emote: SimpleUserEmote, message: Message): void {
        if(message.author.id === emote.user) {
            message.channel.send(emote.content);
        } else {
            message.channel.send('This command is restricted to a specific user');
        }
    }
}