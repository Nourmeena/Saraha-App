import {
  UserModel,
  roleEnum,
  providerEnum,
} from "../../db/models/user.model.js";
import { asyncHandler } from "../../utils/response.js";
import { successResponse } from "../../utils/response.js";
import * as DBService from "../../db/db.service.js";
import * as bcrypt from "../../utils/security/hash.security.js";
import * as crypto from "../../utils/security/encryption.security.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateToken,
  getSignature,
  signatureLevelEnum,
  refreshToken,
  generateCredential,
} from "../../utils/security/token.security.js";
import { customAlphabet } from "nanoid";
import { emailEvent } from "../../utils/event/email.event.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
// // before async handler
// export const signup = async (req, res, next) => {
//   try {
//     const { fullname, email, password, phone } = req.body;
//   console.log({ fullname, email, password, phone });
//   const userExists = await UserModel.findOne({ email }); //return null or dictonary
//   if (userExists) {
//     return res.status(409).json({ message: "User already exists" });
// logic error
//   } else {
//     const user = await UserModel.create([{ fullname, email, password, phone }]);
//  // normal success response
//     return res.status(200).json({ message: "Done", user });
//   }
//     }
//   } catch (error) {
//     return res.status(500).json({
//       error_msg: "server error",
//       error,
//       message: error.message,
//       stack: error.stack,
//     });
//   }
// };

export const signup = asyncHandler(async (req, res, next) => {
  const { fullname, email, password, phone, gender, role } = req.body;
  console.log({ fullname, email, password, phone });

  const userExists = await DBService.findOne({
    model: UserModel,
    filter: { email },
  }); //return null or dictionary

  if (userExists) {
    return next(new Error("email already exists", { cause: 409 })); //this call error middleware directly that has 4 arg
  } else {
    const hashPass = await bcrypt.generateHash({ text: password });

    const encryptPhone = await crypto.encryption({ text: phone });

    const otp = customAlphabet("0123456789", 6)() || "030331";
    const confirmEmailOtp = await bcrypt.generateHash({ text: otp });
    const user = await DBService.create({
      model: UserModel,
      data: [
        {
          fullname,
          email,
          password: hashPass,
          phone: encryptPhone,
          confirmEmailOtp,
          gender,
          role,
        },
      ],
    });
    emailEvent.emit("confirmEmail", {
      to: email,
      otp: otp,
      text: "Hello new user",
    });
    return successResponse({ res, status: 201, data: { user } });
  }
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: false,
      confirmEmailOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(
      new Error("invalid account or already verified", { cause: 404 }),
    );
  }

  const otpTrue = await bcrypt.compareHash({
    text: otp,
    hash: user.confirmEmailOtp,
  });
  if (!otpTrue) {
    return next(new Error("invalid otp", { cause: 404 }));
  }

  const updateUser = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      $set: { confirmEmail: true, confirmedAt: Date.now() },
      $unset: { confirmEmailOtp: 1 },
      $inc: { __v: 1 },
    },
  });
  return updateUser.modifiedCount
    ? successResponse({ res, data: { updateUser } })
    : next(new Error("fail to confirm email", { cause: 404 }));
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.system },
  });
  if (user.deletedAt) {
    return next(new Error("Invalid user", { cause: 404 }));
  }

  const match = await bcrypt.compareHash({
    text: password,
    hash: user.password,
  });
  if (!match) {
    return next(new Error("Invalid user", { cause: 404 }));
  }
  // if (!user.confirmEmail) {
  //   return next(new Error("email not verified",{cause:404}))
  // }
  const credentials = await generateCredential({ user });
  return await successResponse({ res, data: { credentials } });
});

async function verifyGoogleAccount({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_IDS.split(" "),
  });
  const payload = ticket.getPayload();

  return payload;
}

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, name, picture, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("not verified email", { cause: 409 }));
  }
  const userExists = await DBService.findOne({
    model: UserModel,
    filter: { email },
  }); //return null or dictionary

  if (userExists) {
    return next(new Error("email already exists", { cause: 409 })); //this call error middleware directly that has 4 arg
  }

  const [user] = await DBService.create({
    model: UserModel,
    data: [
      {
        fullname: name,
        email,
        picture,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });
  if (user && user.provider === providerEnum.google) {
    const credentials = await generateCredential({ user });
    return successResponse({ res, status: 201, data: { credentials } });
  }
});
//eyJhbGciOiJSUzI1NiIsImtpZCI6ImQyNzU0MDdjMzllODAzNmFhNzM1ZWIyYzE3YzU0ODc2MWNlZDZhNjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2NjUwOTY1Mjc0MjQtMnJjcnIxMWUwNnBuM2I0c2E1bHF2dXRpZ20ycGtuaDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2NjUwOTY1Mjc0MjQtMnJjcnIxMWUwNnBuM2I0c2E1bHF2dXRpZ20ycGtuaDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDE0NTY2MjY0NDAyOTE2MTA3MDAiLCJlbWFpbCI6Im5vdXJhYW4yMDA0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJub25jZSI6Im5vdF9wcm92aWRlZCIsIm5iZiI6MTc3MjA4MzcwNywibmFtZSI6Ik5vdXJhbiBBc2hyYWYiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0VxdXEzeTZ5U01wSDZ2b1FvWXR2cF9td0NhX2V5b3pscXZUSk9tU1Z4aGR4SnJBPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ik5vdXJhbiIsImZhbWlseV9uYW1lIjoiQXNocmFmIiwiaWF0IjoxNzcyMDg0MDA3LCJleHAiOjE3NzIwODc2MDcsImp0aSI6ImZjMGE4MWMwNjFiOTE3MzA3NmE4YWFiZjA3MmEwNDEyNTk5NzkxZmUifQ.kvcPa6hcBV0ML_d5ejeRuMJiox_58_3Vt8_5md7laT_ez2XGmSvwnvmwuJGorywmrtJrVPK2Xn7y49Gt2-pP3boKdwtK6wMcQ1b_ggTzFAbASnK9y_YQpX8aO6fX9cKzx0bqsj1DEDyYd-LiAgO1aFkPLG9o0Yw2pYsTrAiOQp7wwgfXuIiZfIoDyx0l2W9g5sFVl0PeqrrILpnhvKv1JiSm0DjqFI2HTy_tpzplizqrveQdG8_5prDOuXGP9mnL8uuer6c0sZWa0cSGUsISjSUC3JfQq-bJDJ8AFUJkNBiOJCK0OvkqVHaTDAiZ7o8TJtBOM4iMyOBlygfQBMSKBw

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new Error("Google token required", { cause: 400 }));
  }
  const { email, email_verified } = await verifyGoogleAccount({
    idToken: authorization,
  });
  if (!email_verified) {
    return next(new Error("not verified email", { cause: 409 }));
  }
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    return next(new Error("user not signup", { cause: 404 }));
  }
  const credentials = await generateCredential({ user });
  return successResponse({ res, status: 201, data: { credentials } });
});

/////////////////////forget password///////////////////////////

export const sendForgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  //const otp = await customAlphabet("0123456789", 6)();
  const otp = "032145";
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
    data: {
      forgetPasswordOTP: await generateHash({ text: otp }),
    },
  });
  if (!user) {
    return next(new Error("in-valid account"));
  }
  emailEvent.emit("sendForgetPassword", {
    to: email,
    subject: "forget password",
    title: "Saraha Reset-password",
    otp: otp,
  });
  return successResponse({ res, data: user });
});

export const verifyOtpForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
      forgetPasswordOTP: { $exists: true },
    },
  });
  if (!user) {
    return next(new Error("in-valid account"));
  }
  if (!(await compareHash({ text: otp, hash: user.forgetPasswordOTP }))) {
    return next(new Error("invalid otp", { cause: 409 }));
  }
  return successResponse({ res, data: user });
});

export const resetForgetPassword = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
      forgetPasswordOTP: { $exists: true },
    },
    data: {
      password: await generateHash({ text: password }),
      changeCredentialsTime: new Data(),
    },
  });
  if (!user) {
    return next(new Error("in-valid account"));
  }
  return successResponse({ res, data: user });
});
