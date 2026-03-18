const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })

    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token})

    if(isBlacklisted){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
    console.log("JWT_SECRET:", process.env.JWT_SECRET)
    console.log("token:", token)
    console.log("cookies:", req.cookies)
    console.log("header:", req.headers.cookie)

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId)

        req.user = user // we set the found user wittht the help of the token, and set it to the request user and return it 


        return next()   

    }
    catch(err){ // if the token used is invalid
        console.log("JWT ERROR:", err.message)
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
    
}

async function authSystemUserMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }
    const isBlacklisted = await tokenBlacklistModel.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden access, user is not a system user"
            })
        }

        req.user = user
        return next()
        
    }catch(err){
        console.log("JWT ERROR:", err.message)
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}