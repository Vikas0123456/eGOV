const Joi = require("joi");
 
const userSchema = Joi.object().keys({
    name: Joi.string().required().messages({
        "string.empty": "Please enter name",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Please enter email",
        "string.email": "Please enter a valid email address",
    }),
    phone: Joi.number().integer().required().messages({
        "number.base": "Please enter a valid phone number",
        "number.integer": "Please enter a valid phone number",
        "any.required": "Phone number is required",
    }),
    profileImageId: Joi.number().allow(null),
    departmentId: Joi.number().allow(null),
    roleId: Joi.number().allow(null),
    password: Joi.string().messages({
        "string.empty": "Please enter password",
    }),
   
    
});
 
module.exports = {
    userSchema,
};
 