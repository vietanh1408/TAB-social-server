const mongoose = require('mongoose')
const environments = require('../constants/environment')

module.exports.connectDB = async () => {
    try {
        console.log('MONGO_URI....', environments.MONGO_URI)
        await mongoose.connect(environments.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        })
        console.log('🔵 connected database !')
    } catch (err) {
        console.log('🔴🔴🔴 connect database fail !')
    }
}