import joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../multer/cloud.multer.js";

export const sendMessage = {
  params: joi
    .object({
      receiverId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      content: joi.string().min(2).max(20000),
      files: joi
        .object({
          fieldname: generalFields.file.fieldname
            .valid("coverImages")
            .required(),
          originalname: joi.string().required(),
          encoding: joi.string().required(),
          mimetype: generalFields.file.mimetype
            .valid(...Object.values(fileValidation.image))
            .required(),
          //finalPath: joi.string().required(),
          destination: joi.string().required(),
          filename: joi.string().required(),
          path: joi.string().required(),
          size: joi.number().positive().required(),
        })
        .min(1)
        .max(2),
    })
    .required(),
};
