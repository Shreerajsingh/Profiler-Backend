const FreemiumService = require('../services/freemiumToolService');
const freemiumService = new FreemiumService();

const createFreemiumAccount = async (req, res) => {
    const { userId } = req.body;
    try {
        const data = await freemiumService.createFreemiumAccount(userId);
        
        res.status(201).json({ 
            success: true, 
            message: 'Freemium account created', 
            data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getFreemiumAccount = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await freemiumService.getFreemiumAccount(userId);
        
        res.status(200).json({ 
            success: true, 
            data 
        });
    } catch (error) {
        res.status(404).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const removeCredits = async (req, res) => {
    const { userId, toolName, amount } = req.body;
    try {
        const data = await freemiumService.updateFreemiumCredits(userId, toolName, -Math.abs(amount));
        
        res.status(200).json({ 
            success: true, 
            message: 'Credits deducted', 
            data 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const addCredits = async (req, res) => {
    const { userId, toolName, amount } = req.body;
    try {
        const data = await freemiumService.updateFreemiumCredits(userId, toolName, Math.abs(amount));
        
        res.status(200).json({ 
            success: true, 
            message: 'Credits added', 
            data 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const deleteFreemiumAccount = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await freemiumService.deleteFreemiumAccount(userId);
        res.status(200).json({ success: true, message: "Freemium account deleted", data });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};


module.exports = {
    createFreemiumAccount,
    getFreemiumAccount,
    removeCredits,
    addCredits,
    deleteFreemiumAccount
};