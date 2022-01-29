const cloudinary = require('cloudinary').v2

const deleteImageFromCloudinary = async (post) => {
  if (post.image && post.image.publicId) {
    await cloudinary.uploader.destroy(
      post.image.publicId,
      async (err, result) => {
        if (err) {
          throw err
        }
      }
    )
  }
}

module.exports = deleteImageFromCloudinary
