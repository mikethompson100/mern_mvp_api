import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./user/userRouter";
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not defined in the environment variables.");
}
if (!process.env.PORT) {
  throw new Error("PORT is not defined in the environment variables.");
}
mongoose.connect(process.env.DB_URL);

const app = express();
const corsMiddleware = cors();
app.use(corsMiddleware);

app.use(express.json());
app.use('/users', userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
