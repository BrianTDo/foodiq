const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  userid: {
    type: Number,
    required: true,
  },
  restName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  customers: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
