const db = require("../../config/connection");

module.exports = {
  home: async (req, res) => {
    const products = await addProduct.find();
    res.render("user/home",{ products });
  },
};
