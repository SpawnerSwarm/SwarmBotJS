'use strict';

const mysql = require('mysql2/promise');
const SQL = require('sql-template-strings');
const Promise = require('bluebird');

/**
 * @typedef {Object} DbConnectionOptions
 * @property {string} [host=localhost]
 * @property {number} [port=3306]
 * @property {string} user
 * @property {string} password
 * @property {string} database
*/

class Database {
    /**
     * @param {DbConnectionOptions} dbOptions
     * @param {Cephalon} bot
    */
    constructor(dbOptions, bot) {
        const opts = {
            supportBigNumbers: true,
            bigNumberStrings: true,
            Promise,
        };
        Object.assign(opts, dbOptions);
        this.db = mysql.createPool(opts);
        this.bot = bot;
        bot.logger.debug(opts.host);

        this.defaults = {
            prefix: '!',
            respond_to_settings: true,
            delete_after_respond: true,
        };
    }

    /**
     * @param {User} user
     * @param {Date} date
    */
    addMember(user, date) {
        const query = SQL`INSERT INTO MEMBERS (ID, Name, Rank) VALUES (${user.id}, ${user.username}, 'Recruit');`;
        if (date != null) {
            query.append(SQL`INSERT IGNORE INTO RANKS (ID, Recruit) VALUES (${user.id}, ${date});`);
        } else {
            query.append(SQL`INSERT IGNORE INTO RANKS (ID, Recruit) VALUES (${user.id}, ${Date.now()});`);
        }

        return this.db.query(query);
    }

    getPrefix() {
        return new Promise((resolve) => { resolve(process.env.prefix) });
    }

    /**
     * @param {string} id
     */
    getRankForMember(id) {
        let bot = this.bot;
        return new Promise((resolve) => {
            this.db.execute(SQL`SELECT Rank FROM MEMBERS WHERE ID=${id}`, function(err, results, fields) {
                resolve(results[0].Rank);
            })
        });
    }
    /**
     * @param {string} id
     */
    getMember(id) {
        return new Promise((resolve) => {
            this.db.execute(SQL`SELECT * FROM MEMBERS WHERE ID=${id}`, function(err, results, fields) {
                if (results.length !== 0) {
                    resolve(results[0]);
                } else {
                    reject("Member not found");
                }
            })
        })
    }
}

module.exports = Database;