const { queues } = require('./queues')

const { sendVerifiedEmail } = require('./processes/sendVerifiedEmail')

/* PROCESSES */
queues.processSendVerifiedEmail.process((job) => {
    console.log('job.............', job)
    return sendVerifiedEmail(job)
})