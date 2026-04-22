import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../db/db.service.js";
import { UserModel, roleEnum } from "../../db/models/user.model.js";
import { TokenModel } from "../../db/models/token.model.js";
import * as crypto from "../../utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import {
  generateCredential,
  tokenTypeEnum,
  decodeToken,
  logoutEnum,
  createRevokeToken
} from "../../utils/security/token.security.js";
import ms from "ms";
import { encryption } from "../../utils/security/encryption.security.js";

export const profile = asyncHandler(async (req, res, next) => {
  req.user.phone = await crypto.decryption({ text: req.user.phone });
  return successResponse({ res, data: { user: req.user } });
});

export const getNewLogin = asyncHandler(async (req, res, next) => {
  const credentials = await generateCredential({ user: req.user });
  return successResponse({ res, data: { credentials } });
});

export const authorization = ({ accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authenticate account", { cause: 403 }));
    }
    return next();
  });
};

//if need both authorization and authentication
export const auth = ({
  accessRoles = [],
  tokenType = tokenTypeEnum.access,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    req.user = await decodeToken({
      authorization: req.headers.authorization,
      next,
      tokenType,
    });
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authenticate account", { cause: 403 }));
    }
    return next();
  });
};

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      _id: userId,
      confirmEmail: { $exists: true },
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("invalid account", { cause: 404 }));
});

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const { phone, fullname } = req.body;
  if (phone) {
    req.body.phone = await encryption({ text: phone });
  }
  if (fullname) {
    const [firstname, lastname] = fullname.split(" ");
    req.body.firstname = firstname;
    req.body.lastname = lastname;
    delete req.body.fullname;
  }
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: req.user._id,
    },
    data: req.body,
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("invalid account", { cause: 404 }));
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.admin) {
    return next(new Error("not authorized user", { cause: 404 }));
  }
  //if by admin will get user id from params but if by user will get user id from returned id from authenticaion for token
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId || req.user._id,
    },
    data: {
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
      $set: {
        deletedAt: Date.now(),
        deletedBy: req.user._id,
      },
      changeCredentialsTime:new Date()
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("invalid account", { cause: 404 }));
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    data: {
      $unset: {
        deletedAt: 1,
        deletedBy: 1,
      },
      $set: {
        restoredAt: Date.now(),
        restoredBy: req.user._id,
      },
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("Account not found or not deleted", { cause: 404 }));
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.deleteOne({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });
  if (user && user.deletedCount > 0) {
    return successResponse({
      res,
      data: { deletedCount: user.deletedCount },
    });
  }
  return next(
    new Error("Account not found or not eligible for permanent deletion", {
      cause: 404,
    }),
  );
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { flag } = req.body
  let updatedData={}
  switch (flag) {
    case logoutEnum.signOutFromAllDevice:
      updatedData.changeCredentialsTime = new Date()
      break;
    case logoutEnum.signOut:
      await createRevokeToken({ req })
      break;
    default:
      break;
  }
  const { oldPassword, newPassword } = req.body;
  if (!(await compareHash({ text: oldPassword, hash: req.user.password }))) {
    return next(new Error("invalid old password"));
  }
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: req.user._id,
    },
    data: {
      password: await generateHash({ text: newPassword }),
      ...updatedData
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("Not registered account", { cause: 404 }));
});

export const logout = asyncHandler(async (req, res, next) => {
  const { flag } = req.body;
  let status = 200;
  //to not store the jti of each device
  switch (flag) {
    case logoutEnum.signOutFromAllDevice:
      await DBService.updateOne({
        model: UserModel,
        filter: {
          _id: req.user._id,
        },
        data: {
          changeCredentialsTime: new Date(),
        },
      });
      break;
    default:
      await createRevokeToken({req})
      status=201
      break;
  }

  return successResponse({ res, status, data: { decoded: req.decoded } });
});


export const profileImage = asyncHandler(async (req, res, next) => {

  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: req.user._id,
    data: {
      picture:req.file.finalPath
    }
  })  
  return successResponse({ res, data: { user } });
})

export const coverImages = asyncHandler(async (req, res, next )=> {
  // const user = await DBService.findOneAndUpdate({
  //   model: UserModel,
  //   filter: req.user._id,
  //   data: {
  //     coverImages:req.files.map(file=>file.finalPath)
  //   }
  // })  
  // console.log(req.files)
  return successResponse({ res, data:  req.files  });
})