const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const adminRouter = require('./routes/adminRouter');
const userRouter = require('./routes/userRouter');


dotenv.config();

const app = express();
app.use(express.json());

// Router endpoints
app.use('/admin', adminRouter);
app.use('/', userRouter);

async function runBackend(){
    await mongoose.connect(process.env.MONGOOSE_URI)
        .then(() => console.log('connected to database...'))
    
    app.listen(3000, () => {
        console.log('backend server is running on port 3000')
    })

}

runBackend();