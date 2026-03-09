import joi from "joi";
import mongoose from "mongoose";
import {generalFields} from '../../middleware/validation.middleware.js'

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

export const freezeAccount={
  params: joi.object({
    userId:generalFields.id
  })
}