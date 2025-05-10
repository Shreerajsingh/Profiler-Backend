const AuthService = require('../services/authService');
const authService = new AuthService();

async function signup(req, res) {
    try {
        const data = req.body;
        console.log(data);
        const {user, token} = await authService.signup({
            ...data,
            authMethod: "Local"
        });
        
        return res.status(201).json({
            data:{ user, token }, 
            success: true, 
            error: null, 
            message: "successfully registered user"
        });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

async function signin(req, res) {
    try {
        const { email, password} = req.body;

        const {user, token} = await authService.signin(email, password);

        return res.status(201).json({
            data:{ user, token }, 
            success: true, 
            error: null, 
            message: "successfully logged in user"
        });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

async function googleSignUp(req, res) {
    try {
        const data = req.body;
        const {user, token} = await authService.signup({...data, authMethod: "Google"});
        
        return res.status(201).json({
            data:{ user, token }, 
            success: true, 
            error: null, 
            message: "successfully registered user"
        });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

async function googleSignIn(req, res) {
    try {
        const { email } = req.body;

        const {user, token} = await authService.googleSignIn(email);

        return res.status(201).json({
            data:{ user, token }, 
            success: true, 
            error: null, 
            message: "successfully logged in user"
        });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.id;

        const result = await authService.deleteUser(userId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

async function findUser(req, res) {
    try {
        const userId = req.params.id;

        const result = await authService.findUser(userId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Error finding user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    signup,
    signin,
    googleSignIn,
    googleSignUp,
    deleteUser,
    findUser
}