import { Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
const userRouter = Router();

userRouter.post('/', async (req, res) => {
  const hashed = bcrypt.hashSync(req.body.password, 10);
  const user = await UserModel.create({ username: req.body.username, password: hashed })
  return res.json({ ok: true })
});

userRouter.get("/", async (req, res) => {
  try {
    const users = await UserModel.find(); // get all documents
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.body.username });
    if (!user) {
      throw new Error("Username not found.")
    }
    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) {
      throw new Error("Password does not match.")
    }
    // Identity confirmed
      const data = {userId: user.id};
      if (!process.env.SIGNATURE) {
        throw new Error("Signature undefined")
      }
      const token = sign(
        data, 
        process.env.SIGNATURE, 
        {expiresIn: "7d"}
      )
      return res.json({token});                       
  }
  catch (error) {
    res.status(500).json({ message: "Error authenticating" });
  }
});



export default userRouter;