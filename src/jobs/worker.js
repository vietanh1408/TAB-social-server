const { queue } = require('./queues')

const { sendVerifiedEmail } = require('./processes/sendVerifiedEmail')

/* PROCESSES */
queue.processSendVerifiedEmail.process((job) => {
  return sendVerifiedEmail(job)
})
