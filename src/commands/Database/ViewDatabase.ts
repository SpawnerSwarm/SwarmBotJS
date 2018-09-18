import Command from "../../objects/Command";
import * as fs from "fs";
import * as request from "request-promise-native";
import { MessageWithStrippedContent } from "../../objects/Types";
import Cephalon from "../../Cephalon";

export default class ViewDatabase extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'database.viewDatabase', 'viewDatabase', 'View entire member database as a CSV on Google Sheets.');

        this.regex = /^(?:view)?(?:db|database)$/i;

        this.allowDM = true;

        this.requiredRank = 5;
    }

    async run(message: MessageWithStrippedContent) {
        const csv = process.env.SQL_CSV_OUT;
        const g_url = process.env.GOOGLE_URL;
        const g_key = process.env.GOOGLE_KEY;
        if(csv === undefined || g_url === undefined) return false;
        try {
            await this.bot.db.saveCSVData();
            const data = fs.readFileSync(csv);

            let str = data.toString();
            str = encodeURI(str);
            let url = `${process.env.GOOGLE_URL}${g_key === undefined ? '?' : `?key=${g_key}&`}csv=${str}`;
            
            const body = await request.get(url);
            message.channel.send(body);
            return true;
        } catch(err) {
            this.logger.error(err);
            message.channel.send(`\`Error: ${err}\``);
            return false;
        }
    }
}
