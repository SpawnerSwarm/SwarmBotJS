import { Message, Collection } from 'discord.js';
import Cephalon from '../Cephalon';
import * as request from 'request-promise';
import Logger from './Logger';

export default class NeedsMoreJpeg {

    public static async getUrl(_messages: Collection<string, Message>, logger: Logger): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let messages = _messages.array();
            let i = 1;
            for (let x of messages) {
                logger.debug(`  ${i++}) Found ${x.embeds.length} embeds [${x.id}]`);
                for (let y of x.embeds) {
                    let j = 1;
                    logger.debug(`    ${j++}) type: ${y.type}`);
                    if(y.type === 'image') {
                        resolve(y.thumbnail.url);
                        return;
                    }
                }
                logger.debug(`  ${i++}) Found ${x.attachments.array().length} attachments [${x.id}]`);
                for (let y of x.attachments) {
                    if (y[1].height) { //Test if image
                        resolve(y[1].url);
                        return;
                    }
                }
            }
        });
    }
    
    public static async handleMessage(message: Message, logger: Logger): Promise<Message | Message[] | void> {
        const messages = await message.channel.fetchMessages({
            limit: 10,
            before: message.id
        });
        logger.debug(`===needs more jpeg===`);
        logger.debug(`Found ${messages.array().length} messages.`);
        const url = await this.getUrl(messages, logger);
        if(url === '') {
            message.channel.send('Couldn\'t find the image you wanted to JPEG. Send this sooner next time (within 10 messages)');
            return logger.debug(`No URL found for ${message.cleanContent} sent by ${message.author.id} (${message.author.username}`);
        }
        logger.debug(`Found url: ${url}`);
        try {
            const body = await request({
                method: 'POST',
                uri: 'http://needsmorejpeg.com/upload',
                json: {
                    image: url
                }
            });
            logger.debug(`Got response from nmj.com: ${JSON.stringify(body)}`);
            if (body.error) {
                return logger.error(body.error)
            }
            return message.channel.send({
                files: [`https://static.needsmorejpeg.com${body.url}.jpg`]
            });
        } catch(e) {
            return logger.error(e);
        }
    }
}