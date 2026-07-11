const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../config/roles_list");

// register new user
const handleNewUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate our input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required!" });
    }

    // 2. Check for duplicate usernames OR emails
    const duplicateUsername = await User.findOne({ username });
    if (duplicateUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Create user with explicit default roles mapping to ROLES_LIST
    const newUser = await User.create({
      username,
      email,
      password: hashedPwd,
      roles: { User: ROLES_LIST.User },
    });

    res.status(201).json({ message: `User ${username} created successfully` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// handle new login
const handleNewLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validating input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find the user
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Enforce isActive account validation
    if (!foundUser.isActive) {
      return res.status(403).json({
        message: "Account has been deactivated. Please contact support.",
      });
    }

    // Match the passwords
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Extracting roles
    const roles = Object.values(foundUser.roles).filter(Boolean);

    // Creating access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    // Creating refresh token
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    // Save the refreshToken in DB
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Send refreshToken cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: /* process.env.NODE_ENV === "production" */ true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send accessToken response
    res.json({ accessToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// refreshing/getting new accessToken
const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    // Finding user with this refreshToken
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) return res.sendStatus(403);

    //Prevent refresh tokens working for deactivated users
    if (!foundUser.isActive) return res.sendStatus(403);

    // Verify refreshToken
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username) {
          return res.sendStatus(403);
        }

        // Extract roles
        const roles = Object.values(foundUser.roles).filter(Boolean);

        // Issue new accessToken
        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
              roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );
        res.json({ accessToken });
      },
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Logging out
const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    // Finding the user with the refreshToken
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: /* process.env.NODE_ENV === "production" */ true,
      });
      return res.sendStatus(204);
    }

    // If user is found, remove the refreshToken from DB
    foundUser.refreshToken = "";
    await foundUser.save();

    // Clear cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: /* process.env.NODE_ENV === "production" */ true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  handleNewUser,
  handleNewLogin,
  handleRefreshToken,
  handleLogout,
};
