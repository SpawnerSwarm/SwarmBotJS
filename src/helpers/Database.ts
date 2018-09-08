import { createConnection, Connection, RowDataPacket, Query } from "mysql2";
import { exec } from "child_process";
import SQL from "sql-template-strings";

import Ranks, { Rank } from "../objects/Ranks.on";
import Cephalon from "../Cephalon";
import { UrlResolvable, RankNum } from "../objects/Types";
import Member from "../objects/Member";
import { User, Snowflake } from "discord.js";
import Emote from "../objects/Emote";

export type DbConnectionOptions = {
    host: UrlResolvable | "localhost",
    port: number,
    user: string,
    password: string,
    database: string
};

export type EmotePage = {
    results: Emote[],
    count: number
}

export default class Database {
    private db: Connection;
    private bot: Cephalon;

    constructor(dbOptions: DbConnectionOptions, bot: Cephalon) {
        const opts = {
            supportBigNumbers: true,
            bigNumberStrings: true,
            Promise,
        };
        Object.assign(opts, dbOptions);
        this.db = createConnection(opts);
        this.bot = bot;
    }

    getVersion(): Promise<string> {
        return new Promise((resolve) => {
            this.db.query(SQL`SELECT @@version`, function (err, results: RowDataPacket[]) {
                resolve(results[0]['@@version']);
            });
        });
    }

    addMember(user: User, date: Date): Query {
        const query = SQL`INSERT INTO MEMBERS (ID, Name, Rank) VALUES (${user.id}, ${user.username}, 'Recruit');`;
        if (date !== null) {
            query.append(SQL`INSERT IGNORE INTO RANKS (ID, Recruit) VALUES (${user.id}, ${date});`);
        } else {
            query.append(SQL`INSERT IGNORE INTO RANKS (ID, Recruit) VALUES (${user.id}, ${Date.now()});`);
        }

        return this.db.query(query);
    }

    getMember(id: Snowflake): Promise<Member> {
        return new Promise((resolve, reject) => {
            this.db.query(SQL`SELECT MEMBERS.*, RANKS.*
FROM MEMBERS
INNER JOIN RANKS
ON MEMBERS.ID=RANKS.ID
WHERE MEMBERS.ID=${id}
ORDER BY -Rank`,
                function (err, results: RowDataPacket[]) {
                    if (results.length !== 0) {
                        results[0].bot = this.bot;
                        resolve(results[0] as Member);
                    } else {
                        reject('Member not found');
                    }
                });
        });
    }

    createMember(id: Snowflake, name: string): void {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = Number('0' + dd);
        }

        if (mm < 10) {
            mm = Number('0' + mm);
        }

        let day = mm + '/' + dd + '/' + yyyy;
        this.db.execute(SQL`INSERT INTO MEMBERS (\`ID\`, \`Name\`, \`Rank\`) VALUES (${id}, ${name}, '1');`);
        this.db.execute(SQL`INSERT INTO RANKS (\`ID\`, \`Recruit\`) VALUES (${id}, ${day});`);
    }

    promote(member: Member, rank: RankNum, date: Date): void {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = Number('0' + dd);
        }

        if (mm < 10) {
            mm = Number('0' + mm);
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;

        let rankStr = (Ranks.find(x => x.id == rank) as Rank).name;

        this.db.execute(`UPDATE RANKS SET \`${rankStr}\`='${dateStr}' WHERE \`ID\`='${member.ID}';`);
        this.db.execute(SQL`UPDATE MEMBERS SET \`Rank\`=${rank}, \`LastPesteredIndex\`=0 WHERE \`ID\`=${member.ID};`);
    }

    setLastPestered(id: Snowflake): void {
        let date = new Date();
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = Number('0' + dd);
        }

        if (mm < 10) {
            mm = Number('0' + mm);
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;

        this.db.execute(SQL`UPDATE MEMBERS SET \`LastPestered\`=${dateStr}, \`LastPesteredIndex\`=\`LastPesteredIndex\`+1 WHERE \`ID\`=${id};`);
    }

    getRankPopulation(): Promise<number[]> {
        return new Promise((resolve) => {
            let res = [0];
            for (let i = 1; i <= 7; i++) {
                this.db.execute(SQL`SELECT * FROM MEMBERS WHERE \`Rank\`=${i} AND \`Banned\`=0;`, function (err, results: RowDataPacket[]) {
                    if (res.push(results.length) === 8) {
                        resolve(res);
                    }
                });
            }
        });
    }

    getEmote(ref: string): Promise<Emote> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM EMOTES WHERE Reference= ${ref}`, function (err, results: RowDataPacket[]) {
                if (results.length !== 0) {
                    resolve(results[0] as Emote);
                } else {
                    reject('Emote not found');
                }
            });
        });
    }

    getEmoteList(page: number): Promise<EmotePage> {
        return new Promise((resolve, reject) => {
            let db = this.db;
            page = page > 0 ? page - 1 : page;
            page = page * 5 == 0 ? page * 5 : page * 5 - page;
            db.execute(SQL`SELECT * FROM EMOTES LIMIT ${page}, 4`, function (err, results: RowDataPacket[]) {
                db.execute(SQL`SELECT COUNT(*) FROM EMOTES`, function (err2, count) {
                    if (results.length !== 0) {
                        resolve({ results: results as Emote[], count: count[0]['COUNT(*)'] });
                    } else {
                        reject('Unable to get emotes at that page');
                    }
                });
            });
        });
    }

    createEmote(name: string, reference: string, rank: 0 | RankNum, content: string, creator: Snowflake): void {
        this.db.execute(SQL`INSERT INTO EMOTES (\`Name\`, \`Content\`, \`Reference\`, \`Rank\`, \`Creator\`) VALUES (${name}, ${content}, ${reference}, ${rank}, ${creator});`);
    }

    findEmotes(like: string, page: number): Promise<EmotePage> {
        return new Promise((resolve, reject) => {
            let db = this.db;
            let l = `%${like}%`;
            page = page > 0 ? page - 1 : page;
            page = page * 5 == 0 ? page * 5 : page * 5 - page;
            db.execute(SQL`SELECT * FROM EMOTES WHERE Reference LIKE ${l} OR Name LIKE ${l} LIMIT ${page}, 4`, function (err, results: RowDataPacket[]) {
                db.execute(SQL`SELECT COUNT(*) FROM EMOTES WHERE Reference LIKE ${l} OR Name LIKE ${l}`, function (err2, count: RowDataPacket[]) {
                    if (results.length !== 0) {
                        resolve({ results: results as Emote[], count: count[0]['COUNT(*)'] });
                    } else {
                        reject('Unable to get emotes at that page');
                    }
                });
            });
        });
    }

    setBanned(id: Snowflake, banned: 1 | 0): void {
        if (banned !== 1 && banned !== 0) {
            throw 'Invalid Banned State';
        }
        this.db.execute(SQL`UPDATE MEMBERS SET Banned=${banned} WHERE ID=${id}`);
    }

    updateWF(id: Snowflake, WarframeName: string): void {
        this.db.execute(SQL`UPDATE MEMBERS SET WarframeName=${WarframeName} WHERE ID=${id}`);
    }

    updateSK(id: Snowflake, SpiralKnightsName: string): void {
        this.db.execute(SQL`UPDATE MEMBERS SET SpiralKnightsName=${SpiralKnightsName} WHERE ID=${id}`);
    }

    saveCSVData(): Promise<void> {
        return new Promise((resolve, reject) => {
            let str = `mysql ${process.env.MYSQL_DB} --host=${process.env.MYSQL_HOST} --password=${process.env.MYSQL_PASSWORD} --user=${process.env.MYSQL_USER} < ${process.env.SQL_CSV_REQUESTS} | sed 's/\t/,/g' > ${process.env.SQL_CSV_OUT}`;
            console.log(str);
            exec(str,
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

    getOffers(ListingID: Snowflake): Promise<RowDataPacket[]> {
        return new Promise((resolve) => {
            this.db.execute(SQL`SELECT * FROM BZ_OFFERS WHERE ListingID=${ListingID}`, function (err, results: RowDataPacket[]) {
                resolve(results);
            });
        });
    }

    getListing(ListingID: Snowflake): Promise<RowDataPacket> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM BAZAAR WHERE ID=${ListingID}`, function (err, results: RowDataPacket[]) {
                if (results.length !== 0) {
                    this.getOffers(ListingID).then((offers) => {
                        let result = results[0];
                        result.offers = offers;
                        resolve(result);
                    });
                } else {
                    reject('Unable to retrieve Listing');
                }
            }.bind(this));
        });
    }

    createListing(ListingID: Snowflake, Type: 'WTB' | 'WTS', NonNegotiable: 0 | 1, Price: number, Currency: string, Item: string, Bazaar: string): void {
        this.db.execute(SQL`INSERT INTO BAZAAR VALUES(${ListingID}, ${Type}, ${NonNegotiable}, ${Price}, ${Currency}, ${Item}, ${Bazaar}, 0)`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    createOffer(ListingID: Snowflake, ID: Snowflake): void {
        this.db.execute(SQL`INSERT INTO BZ_OFFERS VALUES(${ListingID}, ${ID})`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    closeListing(ListingID: Snowflake): Promise<void> {
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

    closeOffer(ListingID: Snowflake, UserID: Snowflake): void {
        this.db.execute(SQL`DELETE FROM BZ_OFFERS WHERE ID=${UserID} AND ListingID=${ListingID};`, function (err) {
            if (err) this.bot.logger.error(err);
            this.db.execute(SQL`UPDATE BAZAAR SET OfferCount = OfferCount - 1 WHERE ID=${ListingID};`, function (err) {
                if (err) this.bot.logger.error(err);
            }.bind(this));
        }.bind(this));
    }

    updateListing(ListingID: Snowflake, Type: 'WTB' | 'WTS', NonNegotiable: 0 | 1, Price: number, Currency: string, Item: string, Bazaar: string): void {
        this.db.execute(SQL`UPDATE BAZAAR SET Type=${Type}, NonNegotiable=${NonNegotiable}, Price=${Price}, Currency=${Currency}, Item=${Item}, Bazaar=${Bazaar} WHERE ID=${ListingID};`, function (err) {
            if (err) this.bot.logger.error(err);
        }.bind(this));
    }

    //End Bazaar

    //DR
    createBuild(MessageID: Snowflake, Title: string, Item: string, UserID: Snowflake, ImageURL: UrlResolvable, date: Date): void {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = Number('0' + dd);
        }

        if (mm < 10) {
            mm = Number('0' + mm);
        }

        let dateStr = mm + '/' + dd + '/' + yyyy;
        this.db.execute(SQL`INSERT INTO DRUNNERS (\`MessageID\`, \`Title\`, \`Item\`, \`UserID\`, \`ImageURL\`, \`Date\`) VALUES (${MessageID}, ${Title}, ${Item}, ${UserID}, ${ImageURL}, ${dateStr})`, function (err) {
            if (err) this.bot.logger.eror(err);
        }.bind(this));
    }

    designateBestBuild(MessageID: Snowflake): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT ID, Item, Best FROM DRUNNERS WHERE MessageID=${MessageID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                if (results.length !== 0) {
                    if (results[0].Best != 0) reject(`Build ${results[0].ID} already designated as best.`);
                    this.db.execute(SQL`UPDATE DRUNNERS SET Best=0 WHERE Item=${results[0].Item}`, function (err, results: RowDataPacket[]) {
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

    setArchived(MessageID: Snowflake, Archived: 0 | 1): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Archived=${Archived}, Best=0 WHERE MessageID=${MessageID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                resolve(results[0]);
            }.bind(this));
        }).catch(e => this.bot.logger.error(e));
    }

    fetchBuildByMessageID(MessageID: Snowflake): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM DRUNNERS WHERE MessageID=${MessageID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                if (results.length !== 0) {
                    resolve(results[0]);
                }
            });
        }).catch(e => this.bot.logger.error(e));
    }

    fetchBuildByID(ID: Snowflake): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`SELECT * FROM DRUNNERS WHERE ID=${ID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                if (results.length !== 0) {
                    resolve(results[0]);
                }
            });
        }).catch(e => this.bot.logger.error(e));
    }

    setNotBestByMessageID(MessageID: Snowflake): Promise<void | {}> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Best=0 WHERE MessageID=${MessageID}`, function (err) {
                if (err) reject(err);
                resolve();
            });
        }).catch(e => this.bot.logger.error(e));
    }

    updateBuild(MessageID: Snowflake, Title: string, Item: string, UserID: Snowflake): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET Title=${Title}, Item=${Item}, UserID=${UserID} WHERE MessageID=${MessageID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    setRiven(ID: number, RivenURL: UrlResolvable): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.execute(SQL`UPDATE DRUNNERS SET RivenURL=${RivenURL} WHERE ID=${ID}`, function (err, results: RowDataPacket[]) {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    }

    getModule(Name: string): Promise<any> { //Won't allow DBModule assignment
        return new Promise((resolve, reject) => {
            this.db.query(SQL`SELECT * FROM MODULES WHERE Name=${Name}`, function (err, results: RowDataPacket[]) {
                //if (err) reject(err);
                if (results.length !== 0) {
                    resolve(results);
                } else {
                    reject();
                }
            }.bind(this));
        }).catch(e => this.bot.logger.error(e));
    }
}

export type DBModule = {
    Name: string,
    ID: Snowflake,
    Guild: Snowflake,
    Channel: Snowflake,
    Rank: 0 | RankNum
}