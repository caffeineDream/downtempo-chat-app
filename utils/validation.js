const Joi = require('@hapi/joi');

/* Auth validation */
const inputValidation = data => {
    const schema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(4)
            .max(16)
            .required(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{4,1024}$'))
    });
    return schema.validate(data);
};

module.exports.inputValidation = inputValidation;