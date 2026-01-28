const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

function generateToken(userId){
    const token = jwt.sign({ userId }, JWT_SECRET)

    return token;
}

function auth(req, res, next){
    const token = req.headers.authentication

    const auth = token.split(' ')[1];

    try{
        const decoded = jwt.verify(auth, JWT_SECRET)

        if(decoded){
            req.userId = decoded.userId;

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

module.exports = {generateToken, auth}