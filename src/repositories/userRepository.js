const mongoose = require('mongoose');

class UserRepository {
    constructor(model) {
        this.model = model;
    }

    async createUser(data) {
        try {
            const user = this.model(data);
            await user.save();

            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Cannot create user");
        }
    }

    async findUser(email) {
        try {
            const user = await this.model.findOne({ email });

            return user;
        } catch (error) {
            throw new Error("Cannot find user");
        }
    }

    async findById(id) {
        try {
            const user = await this.model.find({ id: mongoose.ObjectId(id) });

            return user;
        } catch (error) {
            throw new Error("Cannot find user");
        }
    }

    async addCreditsToUser(userId, amount) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await this.model.findById(userId).session(session);
            if (!user) throw new Error("User not found");

            user.credits += amount;
            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return user;
        } catch (error) {
            console.log("3rror   ", error);
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = UserRepository;