const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    cart:{
        type:ObjectId,
        required:true,
        ref:'cart'
    },
    address:{
        type:ObjectId,
        required:true,
        ref:'address'
    },
    paymentMethod:{
        type:String,
    },
    orderStatus:String,
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports = order = mongoose.model('order',orderSchema);