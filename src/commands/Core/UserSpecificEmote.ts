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

    async run(message: MessageWithStrippedContent) {
        let emote = UserEmotes.find(x => message.cleanContent.match(x.call) ? true : false) as ComplexUserEmote | SimpleUserEmote | undefined;

        if(emote) {
            if(simple(emote)) {
                this.executeSimpleEmote(emote, message);
                return true;
            } else {
                const content = await emote.function(message.author.id);
                message.channel.send(content);
                return true;
            }
        }
        return false;
    }

    executeSimpleEmote(emote: SimpleUserEmote, message: Message): Promise<Message | Message[]> {
        if(message.author.id === emote.user) {
            return message.channel.send(emote.content);
        } else {
            return message.channel.send('This command is restricted to a specific user');
        }
    }
}