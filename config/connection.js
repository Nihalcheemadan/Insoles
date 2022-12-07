const mongoose = require("mongoose");
const session = require("express-session");



// const MongodbURI = "mongodb://0.0.0.0:27017/userdb";
const MongodbURI = "mongodb+srv://nihal:nPMNVDtjIT2ybDUa@cluster0.mrdwdzm.mongodb.net/Insoles?retryWrites=true&w=majority"  

mongoose.connect(MongodbURI,{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then((res)=>{
  console.log("mongodb connected");
})