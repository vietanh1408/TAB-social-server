const Joi = require('@hapi/joi')

const postValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string(),
    description: Joi.string().max(1024),
    image: Joi.string(),
    likes: Joi.array(),
    comments: Joi.array(),
  })

  return schema.validate(data)
}
module.exports = postValidation
