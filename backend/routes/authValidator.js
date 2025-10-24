import Joi from "joi";

export const signupSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message("Password must include at least one uppercase letter, one lowercase letter, and one number.")
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
  }),
  mobileNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid mobile number format" }),
  location: Joi.object({
    state: Joi.string().required(),
    localGovernment: Joi.string().required(),
    town: Joi.string().required(),
  }).required(),
});
