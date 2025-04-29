const jwt = require('jsonwebtoken');
const firebase = require('firebase-admin');
const serviceAccount = require("../../profiler-backend-ab927-firebase-adminsdk-fbsvc-9bb8fecede.json");

const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/common/jwt');

const userRepository = new UserRepository(User);

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
});


class AuthService {
    async signup(userData) {
        try {
            const user = await userRepository.createUser(userData);

            const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1d'});

            return { user: user._id, token: token };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async signin(email, password) {
        try {
            const user = await userRepository.findUser(email);
            const passCheck = await user.comparePasswords(password, user.password);

            if(!user || !passCheck) {
                return new Error('Invalid email or password');
            }

            const token = generateToken({ id: user._id });

            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            };
        } catch (error) {
            throw error;
        }
    }

    async googleSignIn(userIdToken) {
        if (!userIdToken || typeof userIdToken !== "string") {
            return res.status(400).json({ success: false, error: "Missing or Invalid token" });
        }
    
        try {
            const { name, picture, email } = await firebase.auth().verifyIdToken(userIdToken);
            console.log(">> ", { name, picture, email });
            let foundUser = await User.findOne({ email });

            if (!foundUser) {
                const newUserObj = {
                    name,
                    email,
                    authMethod: "Google",
                    password: null,
                    profileURL: picture,
                };
                foundUser = await new User(newUserObj).save();
            }

            const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '1d'});

            const resData = {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                profileUrl: foundUser.profileURL,
                jwtToken: token
            }

            // console.log(">> ", { resData, foundUser });

            return { resData, foundUser };
        } catch (error) {
            console.error("Token Verification Error:", error);
            res.status(401).json({ success: false, error: "Invalid Token" });
        }
    }
}

module.exports = AuthService;