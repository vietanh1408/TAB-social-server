require('dotenv').config()
const Queue = require('bull')
const { jobType } = require('../jobType')

const REDIS_TASK_URL = 'redis://localhost:6379/2'

const processSendVerifiedEmail = new Queue(
  jobType.PROCESS_SEND_VERIFIED_EMAIL,
  REDIS_TASK_URL
)

module.exports.queue = {
  processSendVerifiedEmail,
}
