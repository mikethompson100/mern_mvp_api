import { Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
const userRouter = Router();

userRouter.get("/getusers", async (req, res) => {
  try {
    const users = await UserModel.find(); // get all documents
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

userRouter.post('/', async (req, res) => {
  const hashed = bcrypt.hashSync(req.body.password, 10);
  const user = await UserModel.create({username: req.body.username, password: hashed})
  return res.json({ ok: true })
});




export default userRouter;