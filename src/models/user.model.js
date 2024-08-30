import { model, Schema } from "mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { decrypt } from "dotenv";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudnary URL
      required: true,
    },
    coverImage: {
      type: String, // Cloudnary URL
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String, // Cloudnary URL
      required: [true, "Password is Required"],
    },
    refreshToken: {
      type: String, // Cloudnary URL
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  this.password = bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model("User", userSchema);
