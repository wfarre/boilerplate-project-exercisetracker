const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  //   username: String,
  description: String,
  duration: Number,
  date: Date,
  userId: String,
  //   _id: String,
});

module.exports = mongoose.model("Exercise", exerciseSchema);
