import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const localFileUpload = ({ customPath = "general" } = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      callback(null, path.resolve(fullPath));
    },
    filename: function (req, file, callback) {
      console.log({ file });
      const uniqueFileName =
        Date.now() + "_" + Math.random() + "_" + file.originalname;
      file.finalPath = basePath + "/" + uniqueFileName;

      callback(null, uniqueFileName);
    },
  });
  return multer({
    dest: "./temp",
    storage,
  });
};
