import * as userService from "./user.service.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { Router } from "express";
import { endpoint } from "./user.authorization.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { localFileUpload } from "../../multer/local.multer.js";
import { fileValidation } from "../../multer/local.multer.js";
const router = Router();

router.get(
  "/",
  authentication(),
  userService.authorization({ accessRoles: endpoint.profile }),
  userService.profile,
);
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLogin,
);
router.get(
  "/:userId",
  validation({ schema: validators.shareProfile }),
  userService.shareProfile,
);
router.patch(
  "/",
  authentication(),
  validation({ schema: validators.updateBasicInfo }),
  userService.updateBasicInfo,
);

router.delete(
  "/freeze-account{/:userId}",
  authentication(),
  validation({ schema: validators.freezeAccount }),
  userService.freezeAccount,
);

router.patch(
  "/restore-account/:userId",
  userService.auth({ accessRoles: endpoint.restoreAccount }),
  validation({ schema: validators.restoreAccount }),
  userService.restoreAccount,
);

router.delete(
  "/:userId",
  userService.auth({ accessRoles: endpoint.deleteAccount }),
  validation({ schema: validators.deleteAccount }),
  userService.deleteAccount,
);

router.patch(
  "/update-password",
  authentication(),
  validation({ schema: validators.updatePassword }),
  userService.updatePassword,
);

router.post("/logout", authentication(), userService.logout);

router.patch(
  "/profile-image",
  authentication(),
  localFileUpload({
    customPath: "profileImage",
    validation: fileValidation.image,
  }).single("profileImage"),
  userService.profileImage,
);

router.patch(
  "/cover-images",
  authentication(),
  localFileUpload({
    customPath: "coverImages",
    validation: fileValidation.image,
  }).array("coverImages"),
  validation({ schema: validators.coverImages }),
  userService.coverImages,
);
export default router;
