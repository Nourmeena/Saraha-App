import joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
export const shareProfile = {
  params: joi.object({
    userId: joi
      .string()
      .required()
      .custom((value, helper) => {
        return mongoose.Types.ObjectId.isValid(value)
          ? value
          : helper.message("invalid id");
      }),
  }),
};

export const updateBasicInfo = {
  body: joi.object({
    fullname: generalFields.fullname,
    gender: generalFields.gender,
    phone: generalFields.phone,
  }),
};

export const freezeAccount = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const restoreAccount = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const deleteAccount = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const updatePassword = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.password
      .valid(joi.ref("newPassword"))
      .required(),
  }),
};

export const logout = {
  body: joi.object({
    flag: joi
      .string()
      .valid(...Object.values(logoutEnum))
      .default(logoutEnum.stayLoggedIn),
  }),
};
