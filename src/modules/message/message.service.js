import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../db/db.service.js";
import { MessageModel } from "../../db/models/message.model.js";
import { UserModel } from "../../db/models/user.model.js";
import * as crypto from "../../utils/security/encryption.security.js";
import {
  uploadFile,
  destroyFile,
  cloud,
  uploadFiles,
  deleteResource,
  deleteFolderByPrefix,
} from "../../multer/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
    const { receiverId } = req.params;
    if (!req.files?.length && !req.body.content) {
      return next(new Error("message content is required"));
    }

    
    if (!await DBService.findOne({
        model: UserModel,
        filter: {
            _id: receiverId,
            deletedAt: { $exists: false },
            confirmEmail:{$exists:true}
        }
    })) {
        return next(new Error("invalid receiver account"))
    }

    const { content } = req.body
    let attachments = []
    if (req.files) {
        attachments = await uploadFiles({
            files: req.files,
            path:`message/${receiverId}`
        })
    }
    const [message] = await DBService.create({
        model: MessageModel,
        data: [{
            content,
            attachments,
            receiverId,
            senderId:req.user?._id
        }]
    })
    return successResponse({res,status:201,data:{message}})
});
