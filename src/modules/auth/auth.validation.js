import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

// ----------------- LOGIN SCHEMA -----------------
export const loginSchema = {
  body: joi
    .object({
      email: generalFields.email,
      password: generalFields.password,
    })
    .required(),
};

// ----------------- SIGNUP SCHEMA -----------------
export const signupSchema = {
  body: loginSchema.body
    .append({
      fullname: generalFields.fullname,
      confirmPassword: generalFields.confirmPassword,
      phone: generalFields.phone
    })
    .unknown(true)
    .required(),
};

export const sendForgetPassword = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const verifyOtpForgetPassword = {
  body: sendForgetPassword.body.append({
    otp: generalFields.otp.required(),
  }),
};

export const resetForgetPassword = {
  body: verifyOtpForgetPassword.body.append({
    password: generalFields.password.required(),
    confirmPassword:generalFields.confirmPassword.required()
  })
}