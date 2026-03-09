import jwt from "jsonwebtoken";
import { UserModel, roleEnum } from "../../db/models/user.model.js";
import { successResponse } from "../../utils/response.js";
import * as DBService from "../../db/db.service.js";

export const signatureLevelEnum = { bearer: "Bearer", system: "System" };
export const tokenTypeEnum={access:"Access",refresh:"Refresh"}

export const generateToken = async ({
  payload = {},
  signature = process.env.TOKEN_SECRET,
  options = { expiresIn: process.env.TOKEN_EXPIRE },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const refreshToken = async ({
  payload = {},
  signature = process.env.TOKEN_SECRET_REFRESH,
  options = { expiresIn: process.env.TOKEN_EXPIRE_REFRESH },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = "nouran2004#",
}) => {
  return jwt.verify(token, signature);
};

export const getSignature = async ({
  signatureLevel = signatureLevelEnum.bearer,
}) => {
  let signature={accessSignature:"undefined",refreshSignature:"undefined"}
  switch(signatureLevel){
    case signatureLevelEnum.system:
      signature.accessSignature = process.env.TOKEN_ADMIN_SECRET;
      signature.refreshSignature = process.env.TOKEN_ADMIN_REFRESH;
      break;
    default:
      signature.accessSignature = process.env.TOKEN_USER_SECRET;
      signature.refreshSignature = process.env.TOKEN_USER_REFRESH;
      break;
  }
  return signature
};

export const decodeToken = async ({ authorization = "", next, tokenType = tokenTypeEnum.access } = {}) => {
  const [bearer, token] = authorization?.split(" ");
  if (!(bearer || token)) {
    return next(new Error("Miss token parts"));
  }
  let signature = await getSignature({ signatureLevel: bearer });
  const decoded = await verifyToken({
    token: token,
    signature: tokenType === tokenTypeEnum.access ? signature.accessSignature : signature.refreshSignature
  });
  if (!decoded?._id) {
    return next(new Error("invalid token", { cause: 401 }));
  }
  const user = await DBService.findById({
    model: UserModel,
    id: decoded._id,
  });

  if (!user) {
    return next(new Error("not registered account"), { cause: 404 });
  }
  
  return user
};

 
export const generateCredential = async ({user}={}) => {
  const signature = await getSignature({
      signatureLevel:
        user.role != roleEnum.user
          ? signatureLevelEnum.system
          : signatureLevelEnum.bearer,
    });
  
    const token = await generateToken({
      payload: { _id: user._id },
      signature: signature.accessSignature,
    });
    const refresh = await refreshToken({
      payload: { _id: user._id },
      signature: signature.refreshSignature,
    });
    return {token,refresh}
}
