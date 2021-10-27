require('dotenv').config()
const redis = require('redis')

module.exports.connectRedis = () => {
  // create redis client
  let client = redis.createClient(process.env.REDIS_PORT)

  client.on('connect', function () {
    console.log('⌛⌛⌛ connected to redis success')
  })
}
