const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true, "Account must be assiciated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status can be either ACTIVE, FROZEN or CLOSED"
        }
    },
    currency:{
        type:String,
        requried:[true, "Currency is required for creating an account"],
        default:"INR"
    },
     
},{
    timestamps:true
})

accountSchema.index({user:1,status:1})

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel