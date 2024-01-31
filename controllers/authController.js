const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require("../config");
const { OAuth2Client } = require("google-auth-library");

// Create OAuth2 client instance
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");

// Generate JWT token for user
const generateToken = (user) => {
  return jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: "1h" });
};

// Register a new user
const registerUser = async (email, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ email, password: hashedPassword });
  return user;
};

// Log in an existing user
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }
  return user;
};

// Verify Google token
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    return { payload: ticket.getPayload() };
  } catch (error) {
    throw new Error("Invalid user detected. Please try again");
  }
};

// Register user route
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists", field: "email" });
    }

    user = await registerUser(email, password);
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).send("Server Error");
  }
};

// Login user route
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    const token = generateToken(user);
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ msg: error.message });
  }
};

// Callback route
exports.callback = async (req, res) => {
  const reslog = req.body;
  res.json({ reslog });
};

// Google login route
exports.googleLogin = async (req, res) => {
  const { code } = req.body;

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const userInfo = await verifyGoogleToken(tokens.id_token);
    
    if (!userInfo.payload.email) {
      return res.status(400).json({ message: "Invalid email from Google response" });
    }
    const email = userInfo.payload.email;
    let user = await User.findOne({ email });
    if (!user) {
      user = await registerUser(email, "randompassword"); // You may want to generate a random password here
    }

    const token = generateToken(user);
    const googleUser = {
      email: userInfo.payload.email,
      name: userInfo.payload.name,
      picture: userInfo.payload.picture
    };
    res.json({ user:googleUser, token });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ error: "Invalid access token" });
  }
};