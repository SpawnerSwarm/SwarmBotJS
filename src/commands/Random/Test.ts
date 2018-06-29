import Command from "../../objects/Command";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Test extends Command {
    constructor(bot) {
        super(bot, 'random.debug.test', 'test', 'Test');

        this.requiredRank = 7;
        this.ownerOnly = true;
    }

    run(message: MessageWithStrippedContent) {
        const member = this.bot.db.getMember(message.author.id).then((member) => {
            message.channel.send(`
${member.ID}
${member.Name}
${member.Rank}
${member.WarframeName}
${member.SpiralKnightsName}
${member.Ally}
${member.Banned}`);
        });
    }
}