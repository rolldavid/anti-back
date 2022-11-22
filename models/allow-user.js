const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const allowSchema = new Schema({
  email: { type: String, required: true, unique: true },
});

allowSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Allow", allowSchema);
