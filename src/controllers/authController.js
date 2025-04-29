const AuthService = require('../services/authService');
const authService = new AuthService();

async function signup(req, res) {
    try {
        const {user, token} = await authService.signup(req.body);
        
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

async function googleSignOut(req, res) {
    try {
        return req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, error: "Sign-out failed" });
            }
            
            return res.status(200).json({ success: true, message: "User signed out successfully" });
        });
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

async function googleSignIn(req, res) {
    try {
        const { idToken } = req.body;

        const { resData, foundUser} = await authService.googleSignIn( idToken );
        
        console.log(">>> ", resData, foundUser);

        res.status(200).json(resData);
    } catch(error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = {
    signup,
    signin,
    googleSignIn,
    googleSignOut
}