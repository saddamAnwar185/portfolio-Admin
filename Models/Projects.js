const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hashtags: {
    type: String,
    required: true,
  },
  live_url: {
    type: String,
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

const Projects = mongoose.model('Projects', ProjectSchema)

module.exports = Projects
