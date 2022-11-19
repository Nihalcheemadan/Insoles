const mongoose = require("mongoose");
const session = require("express-session");



const MongodbURI = "mongodb://0.0.0.0:27017/userdb";

mongoose.connect(MongodbURI,{
  useNewUrlParser:true,
  
  useUnifiedTopology:true
}).then((res)=>{
  console.log("mongodb connected");
})





// let db = mongoose.connection;
// db.once('open',  ()=> {
//   console.log("Connected successfully");
// });

// db.on('error', console.error.bind(console, 'MongoDB connection error:')); 





