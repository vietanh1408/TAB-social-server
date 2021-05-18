const Joi = require('@hapi/joi')

const postValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required().max(255),
        description: Joi.string().required().max(1024),
        image: Joi.any(),
        status: Joi.string(),
        user: Joi.string(),
        reaction: Joi.array(),
        comment: Joi.array()
    })

    return schema.validate(data)

}
module.exports = postValidation