import * as cluster from 'cluster';

import Cephalon from './Cephalon';
import Logger from './helpers/Logger';
import ClusterManger from './helpers/ClusterManager';

const logger: Logger = new Logger(process.env.USE_MAGNIFY);

if(!process.env.TOKEN) logger.fatal("Missing Discord token!"); process.exit(1);
if(!process.env.PREFIX) logger.fatal("Missing prefix!"); process.exit(1);
if(!process.env.OWNER) logger.fatal("Missing Discord owner!"); process.exit(1);

if(cluster.isMaster) {
    const localShards = process.env.LOCAL_SHARDS;
    const shardOffset = process.env.SHARD_OFFSET;

    const cm = new ClusterManger(cluster, logger, localShards, shardOffset);
    cm.start();
} else {
    const totalShards = Number(process.env.SHARDS);
    const shard = new Cephalon(process.env.TOKEN as string, logger, {
        shardId: parseInt(process.env.shard_id as string, 10),
        shardCount: totalShards,
        owner: process.env.OWNER as string, //Snowflake, avoiding import
        prefix: process.env.PREFIX as string
    });
    shard.start();
}