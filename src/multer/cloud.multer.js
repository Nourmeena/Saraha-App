import multer from "multer";


export const fileValidation = {
  image: ["image/jpeg", "image/gif"],
  pdf: ["application/pdf", "application/msword"],
};

export const cloudFileUpload = ({
  validation = [],
} = {}) => {
  

  const storage = multer.diskStorage({});

  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(new Error("invalid file formate"), false);
  };
  return multer({
    fileFilter,
    storage,
  });
};
