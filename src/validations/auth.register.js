const Joi = require('@hapi/joi')

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .alphanum()
            .min(6)
            .max(255)
            .required(),
        email: Joi.string()
            .email()
            .required(),
        phone: Joi.string()
            .min(8)
            .max(12)
            .required(),
        password: Joi.string()
            .required()
            .min(6)
            .max(255)
    })

    return schema.validate(data)

}
module.exports = registerValidation