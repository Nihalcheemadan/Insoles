const express = require("express");
const app = express();
// const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
// const MongoDBSession = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./config/connection");
const multer = require("multer");
const MongoDBSession = require("connect-mongodb-session")(session);

const userRoute = require("./routes/user/userRouter");
const adminRoute = require("./routes/admin/adminRoute");
const guestHome = require("./routes/user/guestRouter");

const nodemailer = require("nodemailer");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname + "/public")));
app.use("/public", express.static("public"));

app.use(logger("dev"));
app.use(cookieParser());

const store = new MongoDBSession({
  uri: "mongodb://0.0.0.0:27017/userdb",
  collection: "my session",
});

const oneDay = 1000* 60 * 60 * 24;
app.use(
  session({
    secret: "key",
    cookie: { maxAge: oneDay },
    saveUninitialized: true,
    resave: false,
    store: store,
  })
);

app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
  next();
});

//multer

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/databaseimages");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.use(
  multer({
    dest: "public/databaseimages",
    storage: fileStorage,
  }).single("image")
);

app.use("/", guestHome);

app.use("/login", userRoute);

app.use("/adminLogin", adminRoute);

app.listen(9000, () => {
  console.log("Server running on port 9000");
});