const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    default: null 
  },
  authMethod: { 
    type: String, 
    enum: ["Google", "Local"], 
    required: true,
    default: "Local"
  },
  pfpURL: { 
    type: String
  },
  credits: {
    type: Number,
    default: 0.0
  }
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePasswords = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
