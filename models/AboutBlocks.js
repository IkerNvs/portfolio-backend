const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  id: String,
  type: String,
  content: String,
  row: Number,
  column: Number,
  imageHeight: Number,
  imageWidth: Number,
  objectFit: String,
});

const About = new mongoose.Schema({
  blocks: [BlockSchema],
  updatedAt: Date,
});

module.exports = mongoose.model("About", About);
module.exports.Block = mongoose.model("AboutBlock", BlockSchema);
