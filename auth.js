const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config();

const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const JWT_USER_SECRET = process.env.JWT_USER_SECRET

// generate auth token for Admin on every sign in
function generateAdminToken(user){
    const token = jwt.sign(user, JWT_ADMIN_SECRET)

    return token;
}

// generate auth token for User on every sign in
function generateUserToken(user){
    const token = jwt.sign(user, JWT_USER_SECRET)

    return token;
}

// checks if user is admin or not
async function adminRoleAuth(req, res, next){
    const role = req.role;

    if(role === "admin"){
        next();
    }else{
        res.status(401).send({
            success : false,
            message : 'not authorised'
        })
    }

}

// check if user exist in database or not
function adminAuth(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(400).send({
            success : false,
            message : 'Authorization header misssing'
        })
    }

    const authArr = authHeader.split(' ');

    if(authArr.length !== 2 || authArr[0] !== 'Bearer'){
        return res.status(400).send({
            success : false,
            message : 'Invalid authorization header'
        })
    }

    const token = authArr[1];

    try{
        const decoded = jwt.verify(token, JWT_ADMIN_SECRET)

        if(decoded){
            // console.log("decoded " , decoded)
            req.userId = decoded.id;
            req.role = decoded.role;

            next();
        }else{
            res.status(400).send({
                success : false,
                message : 'token mismatch'
            })
        }
    }catch(err){
        console.log(err);

        res.status(400).send({
            success : false,
            message : 'invalid token'
        })
    }
}

// check if user exist in database or not
function userAuth(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(400).send({
            success : false,
            message : 'Authorization header misssing'
        })
    }

    const authArr = authHeader.split(' ');

    if(authArr.length !== 2 || authArr[0] !== 'Bearer'){
        return res.status(400).send({
            success : false,
            message : 'Invalid authorization header'
        })
    }

    const token = authArr[1];

    try{
        const decoded = jwt.verify(token, JWT_USER_SECRET)

        if(decoded){
            // console.log("decoded " , decoded)
            req.userId = decoded.id;
            req.role = decoded.role;

            next();
        }else{
            res.status(400).send({
                success : false,
                message : 'token mismatch'
            })
        }
    }catch(err){
        console.log(err);

        res.status(400).send({
            success : false,
            message : 'invalid token'
        })
    }
}

module.exports = {generateAdminToken, generateUserToken, adminRoleAuth, adminAuth, userAuth}