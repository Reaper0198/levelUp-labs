const express = require('express');
const bcrypt = require('bcrypt');

const { UserModel, CourseModel } = require('../db')
const { generateAdminToken, adminRoleAuth, adminAuth } = require('../auth')

const adminRouter = express.Router();

// create new admin account
adminRouter.post('/signup', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = 'admin';

    try{
        const hashedPassword = await bcrypt.hash(password, 5);

        const newAdmin = new UserModel({
            username,
            email,
            role,
            password : hashedPassword
        })

        await newAdmin.save()

        res.status(201).send({
            success : true,
            message : 'new admin created successfully'
        })
    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not create new admin, backend error'
        })
    }
})

// sign in with existing admin account and get authorization token
adminRouter.post('/signin', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const admin = await UserModel.findOne({ email });

        if(!admin){
            res.status(400).send({
                success : false,
                message : 'no such user exist'
            })
            return;
        }

        if(admin.role === 'user'){
            res.status(401).send({
                success : false,
                message : 'unauthorised user'
            })
            return;
        }

        const matchPassword = await bcrypt.compare(password, admin.password);

        if (matchPassword) {

            const token = generateAdminToken({
                id :admin._id,
                role : admin.role
            });

            res.status(200).send({
                success: true,
                message: 'welcome back admin',
                authentication: `${"Bearer " + token}`
            })
        } else {
            res.status(400).send({
                success: false,
                message: 'passwod mismatch'
            })
        }

    } catch (err) {
        console.log(err);

        res.status(500).send({
            success: false,
            message: 'could sign in, backend error'
        })
    }



})

// run adminAuth, adminRoleAuth before every below endpoints are hit.
adminRouter.use(adminAuth, adminRoleAuth);

// signed in admin can create a new course
adminRouter.post('/course/create',  async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const authorId = req.userId;
    // console.log("authorId " ,authorId)
    // console.log("req Id " ,req.userId)

    try{
        const newCourse = new CourseModel({
            name,
            description,
            authorId
        })

        await newCourse.save();

        res.status(201).send({
            success : true,
            message : 'new course created successfully'
        })

    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not create new course, backend error'
        })
    }

})

// admin can see all the courses they have created
adminRouter.get('/course', async (req, res) => {
    const adminId = req.userId;

    try{
        const cousrses= await CourseModel.find({ authorId : adminId })

        res.status(200).send({
            success : true,
            message : 'All courses retrieved',
            payload : cousrses
        })
    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not retrive all courses, backend error'
        })
    }
})

// admin can update the course details by passing all the course
adminRouter.put('/course/update/:courseId', async (req, res) => {
    const adminId = req.userId;
    const courseId = req.params.courseId;
    const name = req.body.name;
    const description = req.body.description;

    try{
        const course = await CourseModel.findOne({_id : courseId, authorId : adminId});
        // find the way to update the course using the instance created in above db call.
        if(course){

            course.name = name;
            course.description = description;

            await course.save();

            res.status(200).send({
                success : true,
                message : 'course details updated successfully'
            })

        }else{
            res.status(400).send({
                success : false,
                message : "no such course exist"
            })

        }




    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not updated the course, backend error'
        })
    }
})

// admin can delete the course using course id.
adminRouter.delete('/course/delete/:id', async (req, res) => {
    const courseId = req.params.id;

    try{

        await CourseModel.findByIdAndDelete({_id : courseId})

        res.status(200).send({
            success : true,
            message : 'course deleted successfully'
        })

    }catch(err){
        console.log(err);
        res.status(500).send({
            success : false,
            message : 'could not delete the course, backend error'
        })
    }


})

module.exports = adminRouter;