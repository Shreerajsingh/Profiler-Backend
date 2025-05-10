const Freemium = require('../models/freemiumTool');
const FreemiumRepository = require('../repositories/freemiumToolRepository');
const freemiumRepository = new FreemiumRepository(Freemium);

class FreemiumService {
    async createFreemiumAccount(userId) {
        try {
            const existing = await freemiumRepository.getByUserId(userId);
            if (existing) return existing;

            const newRecord = await freemiumRepository.create({ userId });
            return newRecord;
        } catch (error) {
            console.error(error);
            throw new Error("Could not create freemium account");
        }
    }

    async getFreemiumAccount(userId) {
        try {
            const account = await freemiumRepository.getByUserId(userId);
            if (!account) throw new Error("Freemium account not found");
            return account;
        } catch (error) {
            throw error;
        }
    }

    async updateFreemiumCredits(userId, toolName, amount) {
        try {
            const updated = await freemiumRepository.updateCredits(userId, toolName, amount);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    async deleteFreemiumAccount(userId) {
        try {
            const result = await freemiumRepository.delete(userId);
            if (!result) throw new Error("Freemium account not found");
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FreemiumService;