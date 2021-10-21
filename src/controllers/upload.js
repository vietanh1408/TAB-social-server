// libs
const cloudinary = require('cloudinary').v2
// extensions
const { removePathFileUpload } = require('../extensions/upload')
// messages
const { messages } = require('../constants/index')

module.exports.upload = async (req, res, next) => {
  try {
    // if (!req.files) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'No file upload',
    //   })
    // }
    // const { file } = req.files
    // if (
    //   file.mimetype !== 'image/png' &&
    //   file.mimetype !== 'image/jpg' &&
    //   file.mimetype !== 'image/jpeg' &&
    //   file.mimetype !== 'video/mp4'
    // ) {
    //   removePathFileUpload(file.tempFilePath)
    //   return res.status(400).json({
    //     success: false,
    //     message: 'File type invalid',
    //   })
    // }
    // cloudinary.uploader.upload(
    //   file.tempFilePath,
    //   {
    //     folder: 'TAB-social',
    //     resource_type: file.mimetype === 'video/mp4' && 'video',
    //   },
    //   async (err, result) => {
    //     if (err) {
    //       throw err
    //     }
    //     removePathFileUpload(file.tempFilePath)
    //     return res.status(200).json({
    //       success: true,
    //       message: 'Upload file successfully',
    //       public_id: result.public_id,
    //       url: result.url,
    //     })
    //   }
    // )

    const file = req.body.data

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: 'TAB-social',
    })
    return res.status(200).json({
      success: true,
      message: messages.UPLOAD_SUCCESS,
      public_id: uploadResponse.public_id,
      url: uploadResponse.url,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}

// remove file upload
module.exports.removeFileUpload = async (req, res) => {
  try {
    const { public_id } = req.body
    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: messages.FILE_NOT_EXIST,
      })
    }
    cloudinary.uploader.destroy(public_id, async (err, result) => {
      if (err) {
        throw err
      }
      return res.status(200).json({
        success: true,
        message: messages.DELETE_SUCCESS,
      })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
    })
  }
}
