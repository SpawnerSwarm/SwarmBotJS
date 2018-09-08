import Command from "../../objects/Command";
import * as fs from "fs";
import Cephalon from "../../Cephalon";
import { MessageWithStrippedContent } from "../../objects/Types";

export default class Help extends Command {
    constructor(bot: Cephalon) {
        super(bot, 'core.help', 'help');

        this.allowDM = true;

        this.requiredRank = 1;

        this.regex = /(?:help|man(?:ual)?|docs?|what)(?: (.+))?/i;
    }

    run(message: MessageWithStrippedContent) {
        let match = message.strippedContent.match(this.regex);
        if(!this._tsoverrideregex(match)) return;
        this.logger.debug(match[1]);
        let name: string;
        
        if(!match[1]) name = '_';
        else name = match[1].toLowerCase();
        
        if (name == 'about-this-server') return;
        if (fs.existsSync(`/var/docs/${name}.md`)) {
            try {
                fs.readFile(`/var/docs/${name}.md`, function (err: NodeJS.ErrnoException, data: Buffer) {
                    if (err) throw err;
                    this.react('✅');
                    let str = data.toString();
                    let formattedStr = str.split('\\split');
                    if(formattedStr.length > 0) {
                        for(let i = 0; i < formattedStr.length; i++) {
                            this.author.send(formattedStr[i].replace('\\split', ''));
                        }
                    }
                    else {
                        this.author.send(data.toString());
                    }
                }.bind(message));
            } catch (err) {
                this.logger.error(err);
            }
        }
    }
}