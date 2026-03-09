import Joi from "joi";

// ----------------- LOGIN SCHEMA -----------------
export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
      }),

    password: Joi.string()
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$"),
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must be 8+ chars, include uppercase, lowercase, number & special character",
        "string.empty": "Password is required",
      }),
  }).required(),
};

// ----------------- SIGNUP SCHEMA -----------------
export const signupSchema = {
  body: loginSchema.body
    .append({
      fullname: Joi.string().min(3).max(50).required().messages({
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters",
        "string.max": "Full name must be at most 50 characters",
      }),

      confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .messages({
          "any.only": "Passwords do not match",
          "string.empty": "Confirm password is required",
        }),
      phone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
          "string.pattern.base": "Phone must be 10-15 digits",
          "string.empty": "Phone is required",
        }),
    })
    .unknown(true).required()
};
