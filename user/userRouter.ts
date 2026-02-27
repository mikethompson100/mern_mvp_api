import { request, Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
const userRouter = Router();

userRouter.post('/', async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ username: req.body.username });
    if (existingUser) {
      throw new Error("User name taken.")
    }
    const hashed = bcrypt.hashSync(req.body.password, 10);
    await UserModel.create({ username: req.body.username, password: hashed });
    return res.json({ ok: true });
  }
  catch (error) {
    res.status(500).json({ message: "Error registering" });
  }
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
    const data = { userId: user.id };
    if (!process.env.SIGNATURE) {
      throw new Error("Signature undefined")
    }
    const token = sign(
      data,
      process.env.SIGNATURE,
      { expiresIn: "7d" }
    )
    return res.json({ token });
  }
  catch (error) {
    res.status(500).json({ message: "Error authenticating" });
  }
});

userRouter.get('/identify', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new Error("Token missing")
    }
    if (!process.env.SIGNATURE) {
      throw new Error("Signature undefined")
    }
    // String to Object
    const data = verify(token, process.env.SIGNATURE);
    if (typeof data === "string") {
      throw new Error("Invalid token")
    }
    const user = await UserModel.findById(data.userId);
    if (!user) {
      throw new Error("User not found.")
    }
    return res.json({ user });
  }
  catch (error) {
    res.status(500).json({ message: "Error identifying user" });
  }
});


export default userRouter;