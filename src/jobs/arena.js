require('dotenv').config()
const Arena = require('bull-arena')
const Bull = require('bull')
const { jobType } = require('./jobType')
const url = require('url')

const queues = [jobType.PROCESS_SEND_VERIFIED_EMAIL]

const getRedisConfig = (redisUrl) => {
    const redisConfig = url.parse(redisUrl)
    return {
        host: redisConfig.hostname || '127.0.0.1',
        port: Number(redisConfig.port || 6379),
        db: (redisConfig.pathname || '/0').substr(1) || '0',
        // password: redisConfig.auth ? redisConfig.auth.split(':')[1] : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        autoResubscribe: true
    }
}

const redisConfig = getRedisConfig(
    process.env.REDIS_TASK_URL || 'redis://localhost:6379/2'
)
const arenaQueues = (queues) => {
    if (queues && queues.length > 0) {
        return queues.map((queue) => {
            return {
                name: queue,
                hostId: 'Redis',
                redis: redisConfig
            }
        })
    }
    return []
}

module.exports.arena = Arena({ Bull, queues: arenaQueues(queues) }, {
    disableListen: false,
    basePath: '/arena',
})