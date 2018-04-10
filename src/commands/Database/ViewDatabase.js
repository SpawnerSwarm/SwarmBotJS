'use strict';

const Command = require('../../Command.js');

const fs = require('fs');
const request = require('request');

class ViewDatabase extends Command {
    /**
     * @param {Cephalon} bot
    */
    constructor(bot) {
        super(bot, 'database.viewDatabase', 'viewDatabase', 'View entire member database as a CSV on Google Sheets.');

        this.regex = new RegExp('^(?:view)?(?:db|database)$', 'i');

        this.allowDM = true;

        this.requiredRank = 5;
    }

    run(message) {
        this.bot.settings.saveCSVData().then(() => {
            fs.readFile(process.env.SQL_CSV_OUT, function (err, data) {
                let str = data.toString();
                str = encodeURI(str);
                //let url = `${process.env.GOOGLE_URL}?key=${process.env.GOOGLE_KEY}&csv=${str}`;

                request.post({url: process.env.GOOGLE_URL, form: { key: process.env.GOOGLE_KEY, csv: str }}, function(err, httpResponse, body) {
                    this.channel.send(body);
                }.bind(this));
            }.bind(message));
        });
    }
}

module.exports = ViewDatabase;
