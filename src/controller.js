import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.dev") });
import express from "express";
import mongoDB from "./db/connection.db.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandler } from "./utils/response.js";
import { sendEmail } from "./utils/email/send.email.js";

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT;
  app.use(express.json());
  //DB
  await mongoDB();
  app.get("/", () => {
    console.log("Hello world");
  });
  //auth
  app.use("/auth", authRouter);
  //user
  app.use("/user", userRouter);
  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ msg: "invalid" });
  });
  //error middleware
  app.use(globalErrorHandler);



  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default bootstrap;
