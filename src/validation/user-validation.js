import Joi from "joi";

const registerUserValidation = Joi.object({
    memberUsername: Joi.string().max(30).required(),
    memberFullname: Joi.string().max(60).required(),
    memberLevel: Joi.number().max(1),
    memberPassword: Joi.string().max(32).required(),
    memberEmail: Joi.string().email(),
})

const loginUserValidation = Joi.object({
    memberUsername: Joi.string().max(30).required(),
    memberPassword: Joi.string().max(60).required()
});

const getUserValidation = Joi.string().max(100).required();

const updateUserValidation = Joi.object({
    memberUsername: Joi.string().max(30).required(),
    memberFullname: Joi.string().max(60).optional(),
    memberLevel: Joi.number().max(1).optional(),
    memberPassword: Joi.string().max(32).required(),
    memberEmail: Joi.string().email().optional(),
})

export {
    registerUserValidation,
    loginUserValidation,
    getUserValidation,
    updateUserValidation
}