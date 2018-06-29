import Command from "../../objects/Command";
import * as fs from "fs";
import * as request from "request";
import { MessageWithStrippedContent } from "../../objects/Types";
import Cephalon from "../../Cephalon";

export default class ViewDatabase extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.viewDatabase', 'viewDatabase', 'View entire member database as a CSV on Google Sheets.');

        this.regex = new RegExp('^(?:view)?(?:db|database)$', 'i');

        this.allowDM = true;

        this.requiredRank = 5;
    }

    run(message: MessageWithStrippedContent) {
        const csv = process.env.SQL_CSV_OUT;
        const g_url = process.env.GOOGLE_URL;
        const g_key = process.env.GOOGLE_KEY;
        if(csv === undefined || g_url === undefined) return;
        message.react('🔄').then((reaction) => {
            this.bot.db.saveCSVData().then(() => {
                fs.readFile(csv, function (err, data) {
                    let str = data.toString();
                    str = encodeURI(str);
                    let url = `${process.env.GOOGLE_URL}${g_key === undefined ? '?' : `?key=${g_key}&`}csv=${str}`;

                    request.get(url, function (err, httpResponse, body) {
                        this.message.channel.send(body);
                        this.reaction.remove().then(() => {
                            this.message.react('✅');
                        });
                    }.bind({message: message, reaction: reaction}));
                }.bind({message: message, reaction: reaction}));
            })
            .catch((err) => {
                this.logger.error(err);
                message.channel.send(`\`Error: ${err}\``);
                reaction.remove().then(() => {
                    message.react('🆘');
                });
            });
        });
    }
}
