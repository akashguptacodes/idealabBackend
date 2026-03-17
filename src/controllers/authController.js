import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { name, year, branch, rollNo, email, password } = req.body;

    const userExists = await User.findOne({ rollNo });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this Roll No" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      year,
      branch,
      rollNo,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          year: user.year,
          branch: user.branch,
          rollNo: user.rollNo,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    const user = await User.findOne({ rollNo });

    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user._id);
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          year: user.year,
          branch: user.branch,
          rollNo: user.rollNo,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid roll number or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v");
  if (user) {
    res.status(200).json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
};
