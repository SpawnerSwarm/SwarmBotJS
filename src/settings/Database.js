'use strict';

const mysql = require('mysql2');
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

/**
 * @typedef {Object} Member
 * @property {number} ID
 * @property {string} Name
 * @property {number} Rank
 * @property {string} WarframeName
 * @property {string} SpiralKnightsName
 * @property {string} SteamName
 * @property {number} FormaDonated
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
        this.db = mysql.createConnection(opts);
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
        return new Promise((resolve) => { resolve(this.bot.prefix); });
    }

    /**
     * @param {string} id
     * @returns {Member}
     */
    getMember(id) {
        return new Promise((resolve, reject) => {
            this.db.query(SQL`SELECT * FROM MEMBERS WHERE ID=${id}`, function (err, results) {
                if (results.length !== 0) {
                    resolve(results[0]);
                } else {
                    reject('Member not found');
                }
            });
        });
    }

    /**
     * @param {string} id
     */
    getRankups(id) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM RANKS WHERE ID=${id}`, function (err, results) {
                if (results.length !== 0) {
                    resolve(results[0]);
                } else {
                    reject('Member not found');
                }
            });
        });
    }

    /**
     * @param {string} id
     */
    createMember(id, name) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        today = mm + '/' + dd + '/' + yyyy;
        this.db.execute(SQL`INSERT INTO MEMBERS (\`ID\`, \`Name\`, \`Rank\`) VALUES (${id}, ${name}, '1');`);
        this.db.execute(SQL`INSERT INTO RANKS (\`ID\`, \`Recruit\`) VALUES (${id}, ${today});`);
    }

    /**
     * @param {string} ref
     */
    getEmote(ref) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM EMOTES WHERE Reference= ${ref}`, function (err, results) {
                if (results.length !== 0) {
                    resolve(results[0]);
                } else {
                    reject('Emote not found');
                }
            });
        });
    }

    /**
     * @param {number} page
     */
    getEmoteList(page) {
        return new Promise((resolve, reject) => {
            page = page > 0 ? page - 1 : page;
            this.db.execute(SQL`SELECT * FROM EMOTES LIMIT ${page * 5}, 4`, function (err, results) {
                if (results.length !== 0) {
                    resolve(results);
                } else {
                    reject('Unable to get emotes at that page');
                }
            });
        });
    }
}

module.exports = Database;