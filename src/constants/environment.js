require('dotenv').config()

console.log('process.env.NODE_ENV.....', process.env.NODE_ENV)
console.log('process.env.production.ONLINE_DB....', process.env.production.ONLINE_DB)
const environments = {
  PORT: process.env.PORT || 4000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_CODE: process.env.GOOGLE_CLIENT_CODE,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  EMAIL: process.env.EMAIL,
  PASS: process.env.PASS,
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  MONGO_URI:
    process.env.NODE_ENV === 'production'
      ? process.env.ONLINE_DB
      : process.env.MONGO_URI || 'mongodb://localhost/TAB-social',
}

module.exports = environments
