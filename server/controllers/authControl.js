const mongoose = require("mongoose");
const models = require("../models/model");
const User = models.User;
const bycryptjs = require("bcryptjs"); 
const errorHandler = require("../utils/error");
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      name === "" ||
      email === "" ||
      password === ""
    ) {
      return next(errorHandler(400, "All fields are required"));
    }
    const hashedPassword = await bycryptjs.hashSync(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
  } catch (e) {
    console.log(e);
    if (e.name == "MongoServerError" && e.code === 11000) {
      return next(errorHandler(409, "Email already exists"));
    } else {
      return next(e);
    }
  }
  return res.status(200).json({ message: "User Created" });
};

const signin = async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
      return next(errorHandler(400, "All fields are required"));
    }
    const user = await User.findOne({ email: email }).exec();
    if (!user) {
      return next(errorHandler(404, "User not Found."));
    }
    const validPassword = bycryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid Email or Password!"));
    }
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.jwt_secret_key,
      { expiresIn: 1000 * 60 * 60 * 24 * 3 }
    );
    const expirationTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);

    const { password: pass, ...rest } = user._doc;
    return res
      .status(200)
      .cookie("Token", token, {
        httpOnly: true,
        secure: false,
        expires: expirationTime,
        maxAge: 1000 * 60 * 60 * 24 * 3
      })
      .json({ ...rest });
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("Token", "none", {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

module.exports = {
  signup,
  signin,
  logout,
};
