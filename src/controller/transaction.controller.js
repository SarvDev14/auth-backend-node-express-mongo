const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")


async function createTransaction(req, res){

    /// validating the request
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"All fields are required: fromAccount, toAccount, amount, idempotencyKey"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount, // finding if the from account exists or not
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount, // finding if the to account exists or not
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })  
    }

    const isTransactionExists = await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })

    if(isTransactionExists){
        if(isTransactionExists.status === "COMPLETED"){

            return res.status(200).json({
                message:"Transaction already processed",
                transaction:isTransactionExists
            })
        }
        if(isTransactionExists.status === "PENDING"){

            return res.status(200).json({
                message:"Transaction is being processed",
               
            })
        }
        if(isTransactionExists.status === "FAILED"){

            return res.status(500).json({
                message:"Transaction processing failed, please retry",
               
            })
        }
        if(isTransactionExists.status === "REVERSED"){

            return res.status(500).json({
                message:"Transaction was reversed, please retry",
            })
        }
    } 
    
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount should be active to process the transaction"
        })
    }

    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}, requested amount is ${amount}`
        })
    }


    // creating transaction pending
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    },
    {session})

    const debitLedgerEntry = await ledgerModel.create({
        account:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT",
            
    }, {session})

    const creditLedgerEntry = await ledgerModel.create({
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT",

    }, {session})

    transaction.status = "COMPLETED"
    await transaction.save({session})
    session.endSession()

    //send transaction email

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount._id)

    res.status(201).json({
        message:"Transaction processed successfully",
        transaction:transaction
    })
}


async function createInitialFundsTransaction(req, res){
    const{toAccount, amount, idempotencyKey} = req.body
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"All fields are required: toAccount, amount, idempotencyKey"
        })
    }
    const toUserAccount = await accountModel.findOne({
        _id:  toAccount, // finding if the to account exists or not
    })

    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    // const fromUserAccount = await accountModel.findOne({
    //     systemUser:true,
    //     user:req.user._id}
    // )

    const userModel = require("../models/user.model")

// find system user
const systemUser = await userModel
    .findOne({ systemUser: true })
    .select("+systemUser")

if(!systemUser){
    return res.status(400).json({
        message:"System user not found"
    })
}

// find account of system user
const fromUserAccount = await accountModel.findOne({
    user: systemUser._id
})

if(!fromUserAccount){
    return res.status(400).json({
        message:"System user account not found"
    })
}

    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }
    let transaction;
    try{

    const session = await mongoose.startSession()
    session.startTransaction()
    transaction = (await transactionModel.create([{
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }], {session}))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT",

    }],{ session})

    await (()=>{
        return new Promise((resolve)=> setTimeout(resolve, 10 * 1000)); // it will be credited after 10 Seconds
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT",

    }],{ session })
    
    await transactionModel.findOneAndUpdate(
        {_id:transaction._id},
        {status:"COMPLETED"},
        {session}

    )

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()
}catch(error){
    
    return res.status(400).json({
        message:"Transaction is pending due to some error, please retry",
      
})}
    return res.status(201).json({
        message:"Initial funds transaction processed successfully",
        transaction:transaction

    })
}


module.exports={
    createTransaction,
    createInitialFundsTransaction
}