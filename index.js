const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

const { UserModel, CourseModel, PurchaseModel } = require('./db')
const { auth, generateToken } = require('./auth')
const adminRouter = require('./adminRouter')

dotenv.config();

mongoose.connect(process.env.MONGOOSE_URI)
    .then(() => console.log('connected to database...'))
    .catch(err => console.log(err))

const app = express();
app.use(express.json());

app.use('/admin', adminRouter);

// app.post('/admin/signin', async (req, res) => {

//     const email = req.body.email;
//     const password = req.body.password;

//     try {
//         const admin = await UserModel.findOne({ email });

//         const matchPassword = await bcrypt.compare(password, admin.password);

//         if (matchPassword) {

//             const token = generateToken(admin._id);

//             res.status(200).send({
//                 success: true,
//                 message: 'welcome back admin',
//                 authentication: `${"Bearer " + token}`
//             })
//         } else {
//             res.status(400).send({
//                 success: false,
//                 message: 'passwod mismatch'
//             })
//         }

//     } catch (err) {
//         console.log(err);

//         res.status(500).send({
//             success: false,
//             message: 'could sign in, backend error'
//         })
//     }



// })

app.post('/signup', async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const role = 'user';

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = new UserModel({
        username,
        email,
        role,
        password: hashedPassword
    })

    try {
        await newUser.save();

        res.status(200).send({
            success: true,
            message: 'new user created successfully'
        })

    } catch (err) {

        console.log(err);
        res.send(400).send({
            success: false,
            message: 'could not save user to database'
        })
    }
})

app.post('/signin', async (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;

    try{
        const user = await UserModel.findOne({ email });

        if(!user){
            res.status(401).send({
                success : false,
                message : 'wrong email. no such user exist'
            })
            return
        }

        const matchPassword = await bcrypt.compare(password, user.password);

        if(matchPassword){
            const token = generateToken(user._id);

            res.status(200).send({
                success : true,
                message : 'welcome back user',
                authentication : `${"Bearer " + token}`
            })
        }else{
            res.status(400).send({
                success : false,
                message : 'wrong password'
            })
        }

    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : "could not sign in, backend error."
        })
    }

})

// app.post('/course/buy')


app.listen(3000, () => {
    console.log('backend server is running on port 3000')
})