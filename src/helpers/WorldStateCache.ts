import * as https from "https";
import { UrlResolvable, Alert, Sortie, Fissure, VoidTraderInstance, CetusCycle } from "../objects/Types";
import Logger from "./Logger";

const worldStateURL = 'https://api.warframestat.us/pc';

export type WorldStateData = {
    timestamp: string,
    news: any[],
    events: any[],
    alerts: Alert[],
    sortie: Sortie[],
    syndicateMissions: any[],
    fissures: Fissure[],
    globalUpgrades: any[],
    flashSales: any[],
    invasions: any[],
    darkSectors: any[],
    voidTrader: VoidTraderInstance,
    dailyDeals: any[],
    simaris: any,
    conclaveChallenges: any[],
    earthCycle: any,
    cetusCycle: CetusCycle,
    constructionProgress: any
}

export default class WorldStateCache {
    private url: UrlResolvable = worldStateURL;
    private timeout: number;
    private currentData: WorldStateData;
    private lastUpdated: number;
    private updating: Promise<WorldStateData>;
    private logger: Logger;
    constructor(timeout: number, logger: Logger) {
        this.timeout = timeout;
        this.logger = logger;

        this.update();
    }

    getData(): Promise<WorldStateData> {
        if (this.updating) {
            return this.updating;
        }
        if (Date.now() - this.lastUpdated > this.timeout) {
            return this.update();
        }
        return Promise.resolve(this.currentData);
    }

    update(): Promise<WorldStateData> {
        this.updating = this.httpGet().then((data) => {
            this.lastUpdated = Date.now();
            this.currentData = JSON.parse(data);
            delete this.updating;
            return this.currentData;
        }).catch((err) => {
            delete this.updating;
            this.logger.error(err);
        }) as Promise<WorldStateData>;
        return this.updating;
    }

    httpGet(): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = https.get(this.url, (response) => {
                if (!response.statusCode || response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
                }
                const body: (string | Buffer)[] = [];
                response.on('data', chunk => body.push(chunk));
                response.on('end', () => resolve(body.join('')));
            });
            request.on('error', err => reject(err));
        });
    }
}