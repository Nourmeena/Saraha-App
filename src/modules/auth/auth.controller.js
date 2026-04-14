import { Router } from "express";
import * as authService from "./auth.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import * as validators from "./auth.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post(
  "/signup",
  validation({ schema: signupSchema }),
  authService.signup,
);
router.get("/login", authService.login);
router.post("/signup/gmail", authService.signupWithGmail);
router.get("/login/gmail", authService.loginWithGmail);
router.patch("/confirm-email", authService.confirmEmail);
router.patch(
  "/send-forget-password",
  validation({ schema: validators.sendForgetPassword }),
  authService.sendForgetPassword,
);

router.patch('/verifyOtp-forget-password',
    validation({ schema: validators.verifyOtpForgetPassword }),
    authService.verifyOtpForgetPassword
)

router.patch('/reset-forget-password',
    validation({ schema: validators.resetForgetPassword }),
    authService.resetForgetPassword
)

export default router;
