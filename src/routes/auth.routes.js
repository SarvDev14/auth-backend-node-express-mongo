const express = require("express")
const authController = require("../controller/auth.controller")



const router = express.Router()

// full name of this is /api/auth/register
router.post("/register", authController.userRegisterController)


// login api which is /api/auth/login
router.post("/login", authController.userLoginController)

// auth logout api
router.post("/logout", authController.userLogoutController)

module.exports = router