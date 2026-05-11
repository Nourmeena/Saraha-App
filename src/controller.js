import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.dev") });
import express from "express";
import mongoDB from "./db/connection.db.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import { globalErrorHandler } from "./utils/response.js";
import { sendEmail } from "./utils/email/send.email.js";
import morgan from 'morgan'
import cors from 'cors'

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT;
  app.use(express.json());
  app.use(morgan('dev'))

  // var whitelist = (process.env.ORIGINS).split(',')
  // var corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null,true)
  //     } else {
  //       callback(new Error('not allowed by cors'))
  //     }
  //   }
  // }
  // app.use(cors(corsOptions))

  app.use(cors());
  //DB
  await mongoDB();
  app.get("/", () => {
    console.log("Hello world");
  });
  //multer
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  //auth
  app.use("/auth", authRouter);
  //user
  app.use("/user", userRouter);
  //message
  app.use("/message", messageRouter);
  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ msg: "invalid" });
  });
  //error middleware
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};;

export default bootstrap;
