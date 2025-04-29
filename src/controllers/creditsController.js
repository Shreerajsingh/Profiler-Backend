const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const userRepository = new UserRepository(User);

async function removeCredits(req, res) {
  try {
    const { userId, amount } = req.body;

    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({ message: "User ID and amount are required." });
    }

    const user = await userRepository.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

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

async function getCredits(req, res) {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await userRepository.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User credits retrieved successfully.",
      credits: user.credits
    });
  } catch (error) {
    console.error("Error getting credits:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  removeCredits,
  getCredits
};
