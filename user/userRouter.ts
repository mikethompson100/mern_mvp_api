import { request, Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
const userRouter = Router();

// Register User
userRouter.post('/', async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ username: req.body.username });
    if (existingUser) {
      throw new Error("User name taken.")
    }
    // Convert password to hashed string
    const hashed = bcrypt.hashSync(req.body.password, 10);
    await UserModel.create({ username: req.body.username, password: hashed });
    return res.json({ ok: true });
  }
  catch (error) {
    res.status(500).json({ message: "Error registering" });
  }
});

/* 
// Get users example
userRouter.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
}); */

// Login existing user
userRouter.post('/login', async (req, res) => {
  try {
    // Find username
    const user = await UserModel.findOne({ username: req.body.username });
    if (!user) {
      throw new Error("Username not found.")
    }
    // Once username is found, match the user password to the db password
    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) {
      throw new Error("Password does not match.")
    }

    // Confirm Identity
    // Create the payload to embed inside the token
    const data = { userId: user.id };
    // Ensure the secret signature exists in environment variables before signing
    if (!process.env.SIGNATURE) {
      throw new Error("Signature undefined")
    }
    // Sign the payload with the secret to generate a JWT, expiring in 30 minutes
    const token = sign(
      data,
      process.env.SIGNATURE,
      { expiresIn: "30m" }
    )
    // Send the token back to the client as a JSON response
    return res.json({ token });
  }
  catch (error) {
    console.error("Login error:", error); 
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
    console.error("Login error:", error); 
    res.status(500).json({ message: "Error identifying user" });
  }
});


export default userRouter;