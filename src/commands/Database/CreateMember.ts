import Command from "../../objects/Command";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class CreateMember extends Command {
    constructor(bot) {
        super(bot, 'database.createMember', 'createMember');

        this.regex = /^(?:createMember|member create) <@!?(\d+)>$/i

        this.allowDM = false;

        this.requiredRank = 4;
    }

    async run(message: MessageWithStrippedContent) {
        const messageMatch = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(messageMatch)) return false;
        if (!messageMatch[1]) {
            message.channel.send('Syntax incorrect');
            return false;
        } else {
            try {
                await this.bot.db.getMember(messageMatch[1]);
                message.channel.send('Member already exists');
                return false;
            } catch (err) {
                if (err == 'Member not found') {
                    const member = await message.guild.fetchMember(messageMatch[1]);
                    await this.bot.db.createMember(messageMatch[1], member.user.username);
                    message.channel.send('Member created');
                    return true;
                } else {
                    this.logger.error(err);
                    message.channel.send(`\`Error: ${err}\``);
                    return false;
                }
            }
        }
    }
}