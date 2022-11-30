const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: Number,
    required: true,
  },
});

module.exports  = mongoose.model("banner", bannerSchema);
