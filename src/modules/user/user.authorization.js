import { roleEnum } from "../../db/models/user.model.js";

export const endpoint = {
  profile: [roleEnum.admin, roleEnum.user],
  restoreAccount: [roleEnum.admin],
  deleteAccount: [roleEnum.admin]
};
