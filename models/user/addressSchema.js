const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  
  user_id:{
    type: mongoose.Types.ObjectId,
    
  },
  fname:{
    type:String,
    required:true
  },
  lname:{
    type:String,
    
  },
  state:{
    type:String,
    
  },
  street:{
    type:String,
    
  },
  town:{
    type:String,
  
  },
  pincode:{
    type:Number,
    
  },
  phone:{
    type:Number,
    required:true
  },
  email:{
    type:String,
  }

});

module.exports = addressModel = mongoose.model("address", addressSchema);
