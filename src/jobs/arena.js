require('dotenv').config()
const Arena = require('bull-arena')
const Bull = require('bull')
const { jobType } = require('./jobType')

const queues = [jobType.PROCESS_SEND_VERIFIED_EMAIL]

const arenaQueues = (queues) => {
    if (queues && queues.length > 0) {
        return queues.map((queue) => {
            return {
                name: queue,
                hostId: 'Redis',
                redis: {
                    port: 6379,
                    host: 'localhost',
                },
            }
        })
    }
    return []
}

module.exports.arena = Arena({ Bull, queues: arenaQueues(queues) }, {
    disableListen: true,
    basePath: '/arena',
})