'use strict';

const https = require('https');

const worldStateURL = 'https://api.warframestat.us/pc';

class WorldStateCache {
    constructor(timeout, logger = console) {
        this.url = worldStateURL;
        this.timeout = timeout;
        this.currentData = null;
        this.lastUpdated = null;
        this.updating = null;
        this.logger = logger;

        this.update();
    }

    getData() {
        if (this.updating) {
            return this.updating;
        }
        if (Date.now() - this.lastUpdated > this.timeout) {
            return this.update();
        }
        return Promise.resolve(this.currentData);
    }

    update() {
        this.updating = this.httpGet().then((data) => {
            this.lastUpdated = Date.now();
            this.currentData = JSON.parse(data);
            this.updating = null;
            return this.currentData;
        }).catch((err) => {
            this.updating = null;
            this.logger.error(err);
        });
        return this.updating;
    }

    httpGet() {
        return new Promise((resolve, reject) => {
            const request = https.get(this.url, (response) => {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
                }
                const body = [];
                response.on('data', chunk => body.push(chunk));
                response.on('end', () => resolve(body.join('')));
            });
            request.on('error', err => reject(err));
        });
    }
}

module.exports = WorldStateCache;