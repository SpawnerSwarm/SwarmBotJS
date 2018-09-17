import Command from "../../objects/Command";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent, GuildTextChannel } from "../../objects/Types";

export default class Kick extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'moderation.kick', 'kick');

        this.bot = bot;
        this.requiredRank = 6;
        this.regex = /kick <@!?(\d+)>(?: (.+))?/i;
        this.allowDM = false;
    }

    async run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return false;
        try {
            const user = await message.guild.fetchMember(match[1]);
            const author = await this.bot.db.getMember(message.author.id);
            try {
                const member = await this.bot.db.getMember(match[1]);
                if (member.Rank >= author.Rank) {
                    message.channel.send('You cannot kick a member of higher or equal rank!');
                    this.logger.warning(`${author.Name} tried to kick ${member.Name} but was too low of rank`);
                    return false;
                } else {
                    this.bot.db.setBanned(member.ID, 1);
                    if (user.guild.id == '137991656547811328') {
                        let content = 'Kick 👢';
                        content += `\n**User:** ${user.user.username}#${user.user.discriminator} (${user.id})`;
                        content += `\n**Moderator:** ${author.Name}`;
                        let reason = 'No reason given.';
                        if (match[2] != undefined) {
                            reason = match[2];
                        }
                        content += `\n**Reason:** ${reason}`;
                        (user.guild.channels.get('274687008406765568') as GuildTextChannel).send(content);
                        user.send(`Hello ${member.Name}, this is an automated message from the Spawner Swarm to inform you that you have been kicked for '${reason}'.  If you want to re-enter the Swarm, please contact an Officer for a re-invite. You will still be subject to the same rules, however.`);
                    }
                    user.kick();
                    this.logger.info(`${author.Name} kicked ${member.Name} from the server`);
                    return true;
                }
            } catch (err) {
                message.channel.send('Unable to find user. They may not be present in the database or a database connection failed. Please contact Mardan.');
                this.logger.error(`Error in !kick: ${err}`);
                return false;
            }
        } catch (err) {
            message.channel.send('Could not find user or was unable to kick them.');
            this.logger.error(`Error in !kick: ${err}`);
            return false;
        }
    }
}