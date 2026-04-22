import joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../multer/local.multer.js";
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
export const logout = {
  body: joi.object({
    flag: joi
      .string()
      .valid(...Object.values(logoutEnum))
      .default(logoutEnum.stayLoggedIn),
  }),
};

export const updatePassword = {
  body: logout.body.append({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.password
      .valid(joi.ref("newPassword"))
      .required(),
  }),
};

export const coverImages = {
  files: joi.array().items(
    joi.object({
      fieldname: generalFields.file.fieldname.valid("coverImages").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: generalFields.file.mimetype.valid(...Object.values(fileValidation.image)).required(),
      finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    }).required()
  ).min(1).max(2).required()
};
