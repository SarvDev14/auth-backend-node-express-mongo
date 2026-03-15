const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address"],
        unique:[true, "Email already exists."]

    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account."],

    },
    password:{
        type:String,
        required:[true, "Password is required to creeate an account"],
        minlenght:[6, "Password should be atleast of length 6"],
        select:false
    }
},{
    timestamps:true
})

/// this pre means, before or pre of save, we do soemthig with the help of async function, like in this, we hash the password before saving

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){ // if not modiefd, then return as it is
        return
    }
    // if midfied passowrd, then we hash it then retunr it
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    return
})

// here it compares the given password and the password stored in the db
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
    
}

const userModel = mongoose.model("user", userSchema) // we create a blueprint in mongodb with this of usermodel
module.exports = userModel