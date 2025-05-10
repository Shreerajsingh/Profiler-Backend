class FreemiumRepository {
    constructor(model) {
        this.model = model;
    }


    async create(data) {
        try {
            const record = new this.model(data);
            await record.save();
            return record;
        } catch (error) {
            console.error(error);
            throw new Error("Cannot create freemium tool record");
        }
    }


    async getByUserId(userId) {
        try {
            return await this.model.findOne({ userId });
        } catch (error) {
            console.error(error);
            throw new Error("Cannot fetch freemium record for user");
        }
    }


    async updateCredits(userId, toolName, amount) {
        try {
            const userTools = await this.model.findOne({ userId });

            if (!userTools) throw new Error("Freemium record not found");

            if (typeof userTools[toolName] !== "number") {
                throw new Error(`Invalid tool name: ${toolName}`);
            }

            userTools[toolName] += amount;

            if (userTools[toolName] < 0) {
                throw new Error("Insufficient credits");
            }

            await userTools.save();
            return userTools;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to update credits");
        }
    }

    async delete(userId) {
        try {
            return await this.model.findOneAndDelete({ userId });
        } catch (error) {
            throw new Error("Failed to delete freemium account");
        }
    }    
}

module.exports = FreemiumRepository;