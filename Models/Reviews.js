const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
type: Number,
    required: true,
  },
  image: {
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
});

const Reviews = mongoose.model("Reviews", reviewSchema)

module.exports = Reviews
