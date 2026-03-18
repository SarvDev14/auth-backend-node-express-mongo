const express = require("express")
const cookieParser = require("cookie-parser")

const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.routes')
const transactionRoutes = require("./routes/transaction.routes")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res)=>{
    res.send("Welcome to the banking API")})

app.use("/api/auth", authRouter) // all those request to the server starting with /api/auth are redirected tot the authRouter
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports=app // we 

// we create server instance and config it in app.js
/// but we start server in server.js
// so we exprt this app into the server.js as we need to run the created server instance in app.js to run it into the server.js
