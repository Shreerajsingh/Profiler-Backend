const mongoose = require('mongoose');
const FreemiumTool = require('../models/freemiumTool');

class UserRepository {
    constructor(model) {
        this.model = model;
    }

    async createUser(data) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            console.log(data);
            const user = this.model(data);
            await user.save({ session });
            
            const freemiumAccount = new FreemiumTool({
                userId: user._id
            });
            await freemiumAccount.save({ session });
    
            await session.commitTransaction();
            session.endSession();
    
            return user;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            throw new Error("Cannot create user and freemium account");
        }
    }    

    async findUser(email) {
        try {
            const user = await this.model.findOne({ email: email });

            return user;
        } catch (error) {
            throw new Error("Cannot find user");
        }
    }

    async findById(id) {
        try {
            const user = await this.model.findOne({_id: id});

            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Cannot find user");
        }
    }

    async delete(userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const user = await this.model.findById(userId).session(session);
            if (!user) throw new Error("User not found");
    
            await this.model.findByIdAndDelete(userId).session(session);
            await FreemiumTool.findOneAndDelete({ userId }).session(session);
    
            await session.commitTransaction();
            session.endSession();
    
            return { message: "User and Freemium account deleted successfully" };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new Error("Failed to delete user and freemium account");
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