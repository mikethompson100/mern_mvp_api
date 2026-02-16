import { Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
const userRouter = Router();


userRouter.post('/', async (req, res) => {
  const hashed = bcrypt.hashSync(req.body.password, 10);
  const user = await UserModel.create({username: req.body.username, password: hashed})
  return res.json({ ok: true })
});





export default userRouter;