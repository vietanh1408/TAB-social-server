const Joi = require('@hapi/joi')

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .required()
            .min(6)
            .max(255)
    })

    return schema.validate(data)

}
module.exports = loginValidation