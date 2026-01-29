const express = require('express')
const bcrypt = require('bcrypt');

const { UserModel, CourseModel, PurchaseModel } = require('./db')
const { auth, generateToken } = require('./auth')

const userRouter = express.Router();

// create a new account
userRouter.post('/signup', async (req, res) => {

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

// sign in with existing account and get authorization token
userRouter.post('/signin', async (req, res) =>{
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
            const token = generateToken({
                id : user._id,
                role : user.role
            });

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

// user can purchase a course and new entry is made to purchase document
// user can buy the same course more than once currently.
userRouter.post('/purchase/:courseId', auth, async(req, res) => {
    const userId = req.userId;
    const courseId = req.params.courseId;

    try{

        const course = await CourseModel.findOne({_id : courseId}).select('_id');

        if(course){

            const newPurchase = new PurchaseModel({
                userId,
                courseId
            })
    
            await newPurchase.save();

            res.status(200).send({
                success : true,
                message : 'purchase saved successfully'
            })

        }else{
            res.status(400).send({
                success : false,
                message : "no such course exist"
            })

        }
    }catch(err){
        console.log(err)

        res.status(500).send({
            success : false,
            message : 'could not save the purchase, backend error'
        })
    }
})


// user can get the array of all the courses id they have bought
userRouter.get('/courses', auth, async (req, res) => {
    const userId = req.userId;
    try{
        const courses = await PurchaseModel.find({userId : userId});

        if(courses){
            res.status(200).send({
                success : true,
                message : 'all courses fetched',
                payload : courses
            })
        }else{
            res.status(200).send({
                success : true,
                message : 'No courses bought yet'
            })
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not fetch the courses, backed error'
        })
    }
})


module.exports = userRouter;