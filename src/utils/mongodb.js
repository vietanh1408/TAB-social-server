const mongoose = require('mongoose')
require('dotenv').config()

module.exports.connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost/TAB-social',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    )
    console.log('🔵🔵🔵 connected database !')
  } catch (err) {
    console.log('🔴🔴🔴 connect database fail !')
  }
}
