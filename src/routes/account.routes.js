const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controller/account.controller")


const router = express.Router()

// POST /api/accounts/
// to create a newe account
// it is  aprotected route

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)

// fetching balance of an account

router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = router