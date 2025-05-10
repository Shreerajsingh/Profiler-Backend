const User = require('../models/user');
const UserRepository = require('../repositories/userRepository');
const userRepository = new UserRepository(User);
const { verifyToken } = require('../utils/common/jwt');

const authenticate  = async function (req, res, next) {
    next();
    const authHeader = req.headers.authorization;
    console.log(req.headers, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Error('Authorization token missing'));
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        const user = await userRepository.findById(payload.id);
        if (!user) throw new Error("User does not exist");

        req.user = user;
        next();
    } catch (err) {
        next(new Error('Invalid or expired token'));
    }
};

module.exports={
    authenticate
}