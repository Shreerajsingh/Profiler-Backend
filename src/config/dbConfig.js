const mongoose = require('mongoose');
const { DB_URL, NODE_ENV } = require('./serverConfig');

async function connectToDB() {
    try {
        if(NODE_ENV == "development") {
            mongoose.connect(DB_URL);
            console.log("MongoDB Connected");
        }
    } catch (error) {
        console.log('Unable to connect to the DB server');
    }
}

module.exports = connectToDB;