﻿'use strict';

const mysql = require('mysql2');
const SQL = require('sql-template-strings');
const Promise = require('bluebird');

const Ranks = require('../resources/Ranks.js');

const exec = require('child_process').exec;

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

        this.defaults = {
            prefix: '!',
            respond_to_settings: true,
            delete_after_respond: true,
        };
    }

    getVersion() {
        return new Promise((resolve) => {
            this.db.query(SQL`SELECT @@version`, function (err, results) {
                resolve(results[0]['@@version']);
            });
        });
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
            this.db.query(SQL`SELECT MEMBERS.*, RANKS.*
FROM MEMBERS
INNER JOIN RANKS
ON MEMBERS.ID=RANKS.ID
WHERE MEMBERS.ID=${id}
ORDER BY -Rank`,
                function (err, results) {
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
     * @param {Member} member
     * @param {number} rank
     * @param {Date} date
     */
    promote(member, rank, date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;

        let rankStr = Ranks.find(x => x.id == rank).name;

        this.db.execute(`UPDATE RANKS SET \`${rankStr}\`='${dateStr}' WHERE \`ID\`='${member.ID}';`);
        this.db.execute(SQL`UPDATE MEMBERS SET \`Rank\`=${rank}, \`LastPesteredIndex\`=0 WHERE \`ID\`=${member.ID};`);
    }

    setLastPestered(id) {
        let date = new Date();
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;

        this.db.execute(SQL`UPDATE MEMBERS SET \`LastPestered\`=${dateStr}, \`LastPesteredIndex\`=\`LastPesteredIndex\`+1 WHERE \`ID\`=${id};`);
    }

    getRankPopulation() {
        return new Promise((resolve) => {
            let res = [0];
            for (let i = 1; i <= 7; i++) {
                this.db.execute(SQL`SELECT * FROM MEMBERS WHERE \`Rank\`=${i} AND \`Banned\`=0;`, function (err, results) {
                    if (res.push(results.length) == 8) {
                        resolve(res);
                    }
                });
            }
        });
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
            let db = this.db;
            page = page > 0 ? page - 1 : page;
            page = page * 5 == 0 ? page * 5 : page * 5 - page;
            db.execute(SQL`SELECT * FROM EMOTES LIMIT ${page}, 4`, function (err, results) {
                db.execute(SQL`SELECT COUNT(*) FROM EMOTES`, function (err2, count) {
                    if (results.length !== 0) {
                        resolve({ results: results, count: count[0]['COUNT(*)'] });
                    } else {
                        reject('Unable to get emotes at that page');
                    }
                });
            });
        });
    }

    createEmote(name, reference, rank, content, creator) {
        this.db.execute(SQL`INSERT INTO EMOTES (\`Name\`, \`Content\`, \`Reference\`, \`Rank\`, \`Creator\`) VALUES (${name}, ${content}, ${reference}, ${rank}, ${creator});`);
    }

    findEmotes(like, page) {
        return new Promise((resolve, reject) => {
            let db = this.db;
            let l = `%${like}%`;
            page = page > 0 ? page - 1 : page;
            page = page * 5 == 0 ? page * 5 : page * 5 - page;
            db.execute(SQL`SELECT * FROM EMOTES WHERE Reference LIKE ${l} OR Name LIKE ${l} LIMIT ${page}, 4`, function (err, results) {
                db.execute(SQL`SELECT COUNT(*) FROM EMOTES WHERE Reference LIKE ${l} OR Name LIKE ${l}`, function (err2, count) {
                    if (results.length !== 0) {
                        resolve({ results: results, count: count[0]['COUNT(*)'] });
                    } else {
                        reject('Unable to get emotes at that page');
                    }
                });
            });
        });
    }

    setBanned(id, banned) {
        if (banned !== 1 && banned !== 0) {
            throw 'Invalid Banned State';
        }
        this.db.execute(SQL`UPDATE MEMBERS SET Banned=${banned} WHERE ID=${id}`);
    }

    updateWF(id, WarframeName) {
        this.db.execute(SQL`UPDATE MEMBERS SET WarframeName=${WarframeName} WHERE ID=${id}`);
    }

    updateSK(id, SpiralKnightsName) {
        this.db.execute(SQL`UPDATE MEMBERS SET SpiralKnightsName=${SpiralKnightsName} WHERE ID=${id}`);
    }

    saveCSVData() {
        return new Promise((resolve, reject) => {
            exec(`mysql ${process.env.MYSQL_DB} --password=${process.env.MYSQL_PASSWORD} --user=${process.env.MYSQL_USER} < ${process.env.SQL_CSV_REQUESTS} | sed 's/\t/,/g' > ${process.env.SQL_CSV_OUT}`,
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                }
            );
        });
    }

    //Bazaar

    /**
     * @param {number} ListingID 
     */
    getOffers(ListingID) {
        return new Promise((resolve) => {
            this.db.execute(SQL`SELECT * FROM BZ_OFFERS WHERE ListingID=${ListingID}`, function (err, results) {
                resolve(results);
            });
        });
    }

    /**
     * @param {number} ListingID 
     */
    getListing(ListingID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM BAZAAR WHERE ID=${ListingID}`, function (err, results) {
                if (results.length !== 0) {
                    this.getOffers(ListingID).then((offers) => {
                        results = results[0];
                        results.offers = offers;
                        resolve(results);
                    });
                } else {
                    reject('Unable to retrieve Listing');
                }
            }.bind(this));
        });
    }

    /**
     * @param {number} ListingID
     * @param {string} Type
     * @param {number} NonNegotiable
     * @param {number} Price 
     * @param {string} Currency 
     * @param {string} Item 
     * @param {string} Bazaar 
     */
    createListing(ListingID, Type, NonNegotiable, Price, Currency, Item, Bazaar) {
        this.db.execute(SQL`INSERT INTO BAZAAR VALUES(${ListingID}, ${Type}, ${NonNegotiable}, ${Price}, ${Currency}, ${Item}, ${Bazaar}, 0)`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    /**
     * @param {number} ListingID 
     * @param {number} ID 
     */
    createOffer(ListingID, ID) {
        this.db.execute(SQL`INSERT INTO BZ_OFFERS VALUES(${ListingID}, ${ID})`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    /**
     * @param {number} ListingID
     */
    closeListing(ListingID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`DELETE FROM BAZAAR WHERE ID=${ListingID};`, function (err) {
                if (err) reject(err);
                this.db.execute(SQL`DELETE FROM BZ_OFFERS WHERE ListingID=${ListingID}`, function (err) {
                    if (err) reject(err);
                    resolve();
                }.bind(this));
            }.bind(this));
        });
    }

    /**
     * @param {number} UserID
     */
    closeOffer(ListingID, UserID) {
        this.db.execute(SQL`DELETE FROM BZ_OFFERS WHERE ID=${UserID} AND ListingID=${ListingID};`, function (err) {
            if (err) this.bot.logger.error(err);
            this.db.execute(SQL`UPDATE BAZAAR SET OfferCount = OfferCount - 1 WHERE ID=${ListingID};`, function (err) {
                if (err) this.bot.logger.error(err);
            }.bind(this));
        }.bind(this));
    }

    /**
     * @param {number} ListingID
     * @param {string} Type
     * @param {number} NonNegotiable
     * @param {number} Price 
     * @param {string} Currency 
     * @param {string} Item 
     * @param {string} Bazaar 
     */
    updateListing(ListingID, Type, NonNegotiable, Price, Currency, Item, Bazaar) {
        this.db.execute(SQL`UPDATE BAZAAR SET Type=${Type}, NonNegotiable=${NonNegotiable}, Price=${Price}, Currency=${Currency}, Item=${Item}, Bazaar=${Bazaar} WHERE ID=${ListingID};`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    //End Bazaar

    //DR
    /**
     * @param {number} MessageID
     * @param {string} Title
     * @param {string} Item
     * @param {number} UserID
     * @param {string} ImageURL
     * @param {Date} date
     */
    createBuild(MessageID, Title, Item, UserID, ImageURL, date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;
        this.db.execute(SQL`INSERT INTO DRUNNERS (\`MessageID\`, \`Title\`, \`Item\`, \`UserID\`, \`ImageURL\`, \`Date\`) VALUES (${MessageID}, ${Title}, ${Item}, ${UserID}, ${ImageURL}, ${dateStr})`, function (err) {
            if (err) this.bot.logger.eror(err);
        }.bind(this));
    }

    designateBestBuild(MessageID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT ID, Item, Best FROM DRUNNERS WHERE MessageID=${MessageID}`, function (err, results) {
                if (err) reject(err);
                if (results.length != 0) {
                    if (results[0].Best != 0) reject(`Build ${results[0].ID} already designated as best.`);
                    this.db.execute(SQL`UPDATE DRUNNERS SET Best=0 WHERE Item=${results[0].Item}`, function (err, results) {
                        if (err) reject(err);
                        this.db.execute(SQL`UPDATE DRUNNERS SET Best=1 WHERE MessageID=${MessageID}`, function (err) {
                            if (err) reject(err);
                        });
                        resolve(results);
                    }.bind(this));

                }
            }.bind(this));
        }).catch(e => this.bot.logger.error(e));
    }

    setArchived(MessageID, Archived) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Archived=${Archived}, Best=0 WHERE MessageID=${MessageID}`, function (err, results) {
                if (err) reject(err);
                resolve(results[0]);
            }.bind(this));
        }).catch(e => this.bot.logger.error(e));
    }

    fetchBuildByMessageID(MessageID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM DRUNNERS WHERE MessageID=${MessageID}`, function (err, results) {
                if (err) reject(err);
                if (results.length != 0) {
                    resolve(results[0]);
                }
            });
        }).catch(e => this.bot.logger.error(e));
    }

    setNotBestByMessageID(MessageID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Best=0 WHERE MessageID=${MessageID}`, function (err) {
                if (err) reject(err);
            });
        }).catch(e => this.bot.logger.error(e));
    }

    updateBuild(MessageID, Title, Item, UserID) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Title=${Title}, Item=${Item}, UserID=${UserID} WHERE MessageID=${MessageID}`, function (err, results) {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    /**
     * @param {string} Name
     */
    getModule(Name) {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM MODULES WHERE Name=${Name}`, function (err, results) {
                if (err) reject(err);
                if (results.length != 0) {
                    resolve(results[0]);
                }
            }.bind(this));
        }).catch(e => this.bot.logger.error(e));
    }
}

module.exports = Database;
