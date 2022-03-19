const { queues } = require('./queues')

const { sendVerifiedEmail } = require('./processes/sendVerifiedEmail')

/* PROCESSES */
queues.processSendVerifiedEmail.process((job) => {
    return sendVerifiedEmail(job)
})