import { request, Router } from 'express';
import UserModel from './UserModel';
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import authenticate from './authenticate';
const userRouter = Router();

// Register User
userRouter.post('/', async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }
    // Convert password to hashed string
    const hashed = bcrypt.hashSync(req.body.password, 10);
    const newuser = await UserModel.create({ email: req.body.email, password: hashed });

    // Get token for newly created user and redirect to /dashboard page
    // Create the payload to embed inside the token
    const data = { userId: newuser.id };
    // Ensure the secret signature exists in environment variables before signing
    if (!process.env.SIGNATURE) {
      throw new Error("Signature undefined")
    }
    // Sign the payload with the secret to generate a JWT, expiring in 30 minutes
    const token = sign(
      data,
      process.env.SIGNATURE,
      { expiresIn: "15m" }
    )
    // Send the token back to the client as a JSON response
    return res.json({ token });
  }
  catch (error) {
    res.status(500).json({ message: "Error registering" });
  }
});

// Delete User
userRouter.delete('/', async (req, res) => {
  try {
    // Confirm current user
    const user = await authenticate(req.headers.authorization);

    // Find user to delete
    await UserModel.deleteOne({ email: user.email });
    return res.json({ ok: true });
  }
  catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Login existing user
userRouter.post('/login', async (req, res) => {
  try {
    // Find username
    const user = await UserModel.findOne({ username: req.body.username });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }
    // Once username is found, match the user password to the db password
     if (!user.password) {
      return res.status(400).json({
        message: "Password does not exist. Encourage user to use google login."
      });
     }
    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
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
      { expiresIn: "15m" }
    )
    // Send the token back to the client as a JSON response
    return res.json({ token });
  }
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error authenticating" });
  }
});

// Identify user
userRouter.get('/identify', async (req, res) => {
  try {
    const user = await authenticate(req.headers.authorization);
    return res.json({ user });
  }
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error identifying user" });
  }
});

// Update user count
userRouter.patch('/count', async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.body.username });
    if (user) {
      await UserModel.findByIdAndUpdate(
        user._id,
        { $inc: { count: 1 } }
      );
    }
    return res.status(200).json({
      success: true
    });
  }
  catch (error) {
    console.error("Unable to locate user for counter update:", error);
    res.status(500).json({ message: "Error identifying user" });
  }
});

// OAuth endpoints. Send to google login screen.
userRouter.get('/google', async (req, res) => {
  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google client id missing.")
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "http://localhost:4000/users/google/callback",
    response_type: "code",
    scope: "openid email profile"
  })
  const url = `${base}?${params}`;
  res.redirect(url);
});

userRouter.get('/google/callback', async (req, res) => {
  try {
    // 'Our app authorizing', confirmation code
    if (typeof req.query.code !== "string") {
      throw new Error("Invalid code format.")
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google client id missing.")
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google client secret missing.")
    }
    const accessTokenURL = "https://oauth2.googleapis.com/token";
    const accessTokenResponse = await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:4000/users/google/callback"
      })
    })

    const accessTokenData = await accessTokenResponse.json();
    const profileUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    const profileResponse = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${accessTokenData.access_token}`
      }
    });
    const profileData = await profileResponse.json();
    console.log("profileData", profileData);

    // When google id is confirmed, store new user or confirm profile 
    // Find username
    const user = await UserModel.findOne({ googleId: profileData.sub });

    if (!user) {
      const newuser = await UserModel.create({ email: profileData.email, googleId: profileData.sub });
      console.log("see new user:", newuser);
    }

    // if google id matches a user in db
    // else if no match then add them to db


    // whether first time or current user give a token


  }

  catch {

  }
})



export default userRouter;