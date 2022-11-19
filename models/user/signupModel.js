  const mongoose = require("mongoose");

  const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      
    },
    phone: {
      type: Number,
      
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true
    },
    isVarified:{
      type:Boolean 
    },
    status: {  
      type:String,
      default:"unblocked"
    },
    date:{
      type:Date,
      default:Date.now()
    },




  });

  module.exports = signupModel = mongoose.model('userdata',UserSchema)