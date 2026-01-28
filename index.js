const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const adminRouter = require('./adminRouter');
const userRouter = require('./userRouter');

dotenv.config();

mongoose.connect(process.env.MONGOOSE_URI)
    .then(() => console.log('connected to database...'))
    .catch(err => console.log(err))

const app = express();
app.use(express.json());

// Router endpoints
app.use('/admin', adminRouter);
app.use('/', userRouter);


app.listen(3000, () => {
    console.log('backend server is running on port 3000')
})