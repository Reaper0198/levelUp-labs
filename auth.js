const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

// generate auth token on every sign in
function generateToken(user){
    const token = jwt.sign(user, JWT_SECRET)

    return token;
}

// checks if user is admin or not
async function adminAuth(req, res, next){
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
function auth(req, res, next){
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
        const decoded = jwt.verify(token, JWT_SECRET)

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

module.exports = {generateToken, adminAuth, auth}