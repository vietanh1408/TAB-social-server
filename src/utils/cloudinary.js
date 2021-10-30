const cloudinary = require('cloudinary').v2
const environments = require('../constants/environment')

cloudinary.config({
  cloud_name: environments.CLOUD_NAME,
  api_key: environments.CLOUD_API_KEY,
  api_secret: environments.CLOUD_API_SECRET,
  secure: true,
})
