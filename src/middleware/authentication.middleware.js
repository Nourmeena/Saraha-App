import { asyncHandler } from "../utils/response.js";
import { decodeToken, tokenTypeEnum } from "../utils/security/token.security.js";
import { verifyToken, getSignature } from "../utils/security/token.security.js";
import { UserModel } from "../db/models/user.model.js";
import { successResponse } from "../utils/response.js";
import * as DBService from "../db/db.service.js";

export const authentication = ({tokenType=tokenTypeEnum.access}={}) => { 
  return asyncHandler(
    async (req, res, next) => {
      req.user = await decodeToken({ authorization: req.headers.authorization, next, tokenType })
      return next()
  })

};
