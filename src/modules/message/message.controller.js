import { Router } from 'express'
import * as validators from "./message.validation.js";
import * as messageService from "./message.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import { cloudFileUpload, fileValidation } from "../../multer/cloud.multer.js";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/:receiverId",
    cloudFileUpload({validation:fileValidation.image}).array("attachments",2),
    validation({ schema: validators.sendMessage }),
    messageService.sendMessage
)

router.post(
  "/sender/:receiverId",
  authentication(),
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 2),
  validation({ schema: validators.sendMessage }),
  messageService.sendMessage,
);

export default router