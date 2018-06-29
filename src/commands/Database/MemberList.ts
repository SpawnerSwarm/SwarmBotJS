import Command from "../../objects/Command";
import Ranks from "../../objects/Ranks.on";
import Cephalon from "../../Cephalon";

export default class MemberList extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.memberList', 'memberList');

        this.bot = bot;

        this.requiredRank = 1;
    }

    run(message) {
        let str = '```xl\n';
        this.bot.db.getRankPopulation().then((res: number[]) => {
            for (let i = 1; i <= 7; i++) {
                str += `${Ranks[i].name}: ${res[i]} out of ${Ranks[i].max}\n`;
            }
            str += '\n```';
            message.channel.send(str);
        });
    }
}