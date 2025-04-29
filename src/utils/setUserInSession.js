const setUserDataInSession = (req, user) => {
    req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        profileURL: user.profileURL,
    };
};

module.exports = setUserDataInSession;
