import { asyncHandler } from "../utils/response.js";
import {
  decodeToken,
  tokenTypeEnum,
} from "../utils/security/token.security.js";
import { verifyToken, getSignature } from "../utils/security/token.security.js";
import { UserModel } from "../db/models/user.model.js";
import { successResponse } from "../utils/response.js";
import * as DBService from "../db/db.service.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const [user, decoded] = await decodeToken({
      authorization: req.headers.authorization,
      next,
      tokenType,
    });
    req.user = user;
    req.decoded = decoded;
    //"attaches" the user and the decoded info directly to the req
    return next();
  });
}; //return the user and decoded, so when logout can get decoded jti and stores it in token table
