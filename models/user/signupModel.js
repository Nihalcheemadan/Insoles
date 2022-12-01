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
    required: true,
  },
  isVarified: {
    type: Boolean,
  },
  status: {
    type: String,
    default: "unblocked",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  type: {
    type: String,
    default: "user",
  },
});

module.exports = signupModel = mongoose.model("userdata", UserSchema);
