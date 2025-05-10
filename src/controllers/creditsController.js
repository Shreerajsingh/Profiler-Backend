const mongoose = require('mongoose');
const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const userRepository = new UserRepository(User);

async function removeCredits(req, res) {
  try {
    const { userId, amount } = req.body;

    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({ message: "User ID and amount are required." });
    }

    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.credits < amount) {
      return res.status(400).json({ message: "Insufficient credits." });
    }

    user.credits -= amount;
    await user.save();

    return res.status(200).json({
      message: "Credits removed successfully.",
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error("Error removing credits:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function addCredits(req, res) {
  const { userId, amount } = req.body;

  if (!userId || typeof amount !== 'number') {
    return res.status(400).json({ message: "User ID and amount are required." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    user.credits += amount;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Credits added successfully.",
      userId: user._id,
      updatedCredits: user.credits
    });
  } catch (error) {
    console.error("Error adding credits:", error.message);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getCredits(req, res) {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User credits retrieved successfully.",
      userId: user.id,
      email: user.email,
      credits: user.credits
    });
  } catch (error) {
    console.error("Error getting credits:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  removeCredits,
  getCredits,
  addCredits
};