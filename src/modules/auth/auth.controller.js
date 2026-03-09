import { Router } from 'express'
import * as authService from './auth.service.js'
import { validation } from '../../middleware/validation.middleware.js'
import {signupSchema,loginSchema} from './auth.validation.js'

const router = Router()

router.post('/signup',validation({schema:signupSchema}), authService.signup);
router.get("/login", authService.login);
router.post('/signup/gmail', authService.signupWithGmail)
router.get("/login/gmail", authService.loginWithGmail);
router.patch("/confirm-email", authService.confirmEmail);

export default router

