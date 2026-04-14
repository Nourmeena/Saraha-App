import { asyncHandler, successResponse } from "../utils/response.js";
import Joi from "joi";
import { genderEnum } from "../db/models/user.model.js";
import mongoose from "mongoose";

export const generalFields = {
  id: Joi.string().custom((value, helper) => {
    return mongoose.Types.ObjectId.isValid(value)
      ? value
      : helper.message("invalid id");
  }),
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
  fullname: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name must be at most 50 characters",
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
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
  gender: Joi.string().valid(...Object.values(genderEnum)),
  otp: Joi.string().pattern(/^[0-9]{6}$/)
};

export const validation = ({ schema }) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key]);

      if (validationResult.error) {
        // Transform Joi errors into readable format
        validationErrors.push(validationResult.error?.details);
      }
    }
    console.log(validationErrors);

    if (validationErrors.length) {
      return res
        .status(400)
        .json({ err_message: "validation error", error: validationErrors });
    }

    return next();
  });
};
