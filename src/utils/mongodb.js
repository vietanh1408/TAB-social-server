const mongoose = require('mongoose')
require('dotenv').config()

module.exports.connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.ONLINE_DB || 'mongodb://localhost/TAB-social',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    )
    console.log('🔵 connected database !')
  } catch (err) {
    console.log('🔴 connect database fail !')
  }
}
