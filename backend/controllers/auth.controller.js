import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { redis } from "../lib/redis.js";

dotenv.config();

const generateTokens = (userId)=>{
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})
  const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"7d"})

  return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken , "EX", 7*24*60*60 ); // 7days , not compulsory to pass EX |No, it is not strictly compulsory, but if you omit this option, the stored refresh token will never expire unless explicitly removed. This could lead to security issues (for example, if someone manages to steal a refresh token, they could use it indefinitely).

}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attack, cross site scripting atttack
    secure: process.env.NODE_ENV === "production", //
    sameSite: "strict", //prevents CRSF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, //15min
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attack, cross site scripting atttack
    secure: process.env.NODE_ENV === "production", //
    sameSite: "strict", //prevents CRSF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //7d
  });
};

export const signup = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const user = await User.create({ name, email, password });

    // authenticate user
    const {accessToken, refreshToken} = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);


    res.status(201).json({ 
      user : { _id: user._id , name : user.name, email: user.email, role: user.role}, 
      message: "User created successfully" 
    });
      
  } 
  catch (error) {
    console.log("Error in signup controller"+ error.message)
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  res.send("login route called ");
};
export const logout = async (req, res) => {
  res.send("logout route called ");  
};
