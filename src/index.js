const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const paymentRouter = require('./routes/paymentRouter');
const freemiumRouter = require('./routes/freemiumRoutes');
const creditRouter = require('./routes/creditRoutes');

const connectToDB = require('./config/dbConfig');

dotenv.config();

const app = express();

app.use(cors({origin: "*", methods: ["GET", "POST"]}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/auth', authRouter); 
app.use('/api/credits', creditRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/freemium', freemiumRouter);

app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    await connectToDB();
})