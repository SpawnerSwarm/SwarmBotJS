import Command from "../../objects/Command";
import { MessageWithStrippedContent } from "../../objects/Types";
import { GuildMember } from "discord.js";

export default class CreateMember extends Command {
    constructor(bot) {
        super(bot, 'database.createMember', 'createMember');

        this.regex = /^(?:createMember|member create) <@!?(\d+)>$/i

        this.allowDM = false;

        this.requiredRank = 4;
    }

    run(message: MessageWithStrippedContent) {
        const messageMatch = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(messageMatch)) return;
        if (!messageMatch[1]) {
            message.channel.send('Syntax incorrect');
        } else {
            this.bot.db.getMember(messageMatch[1]).then(() => {
                message.channel.send('Member already exists');
                return;
            }).catch((err) => {
                if (err == 'Member not found') {
                    message.guild.fetchMember(messageMatch[1]).then((member: GuildMember) => {
                        this.bot.db.createMember(messageMatch[1], member.user.username);
                        message.channel.send('Member created');
                    });
                } else {
                    this.logger.error(err);
                    message.channel.send(`\`Error: ${err}\``);
                }
            });
        }
    }
}