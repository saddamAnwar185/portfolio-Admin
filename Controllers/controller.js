const { cloudinary } = require("../lib/cloudinary");
const { setUser } = require("../Middlewares/Auth");
const Password = require("../Models/Password");
const bcrypt = require("bcrypt");
const Projects = require("../Models/Projects");
const Reviews = require("../Models/Reviews");

const addPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const passwords = await Password.find({});
    if (passwords.length >= 1) {
      return res.json({
        success: false,
        message: "Password already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newGenPassword = await new Password({ password: hashed }).save();

    return res.json({
      success: true,
      message: "New Password Created",
      newGenPassword,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // get the stored password document (assuming only one)
    const existing = await Password.findOne({});
    if (!existing) {
      return res.json({
        success: false,
        message: "No password set yet",
      });
    }

    // compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, existing.password);

    if (isMatch) {
      const uid = setUser(existing);
      res.cookie("uid", uid, {
        httpOnly: true, // prevents client-side JS from reading it
        maxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
        sameSite: "lax", // adjust if needed
        secure: false, // true if using HTTPS in production
      });
      return res.json({
        success: true,
        message: "Login success",
        user: existing,
      });
    } else {
      return res.json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleShowProjects = async (req, res) => {
  try {
    const allProjects = await Projects.find({});

    res.json({ success: true, allProjects });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

const handleIsVerify = (req, res) => {
  try {
    res.json({ success: true, message: "User is Login" });
  } catch (error) {
    console.log(error);
    return res.json({ success: true, message: "User is Login" });
  }
};

const handleAddProject = async (req, res) => {
  const { name, title, description, hashtags, live_url } = req.body;
  const file = req.files?.file;

  try {
    if (!name || !title || !description || !hashtags || !live_url) {
      return res.json({ success: false, message: "All Fields are required" });
    }

    if (!file) {
      return res.json({ success: false, message: "Image is required" });
    }

    const results = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "/projects",
    });

    if (!results) {
      res.json({ success: false, message: "Image Cannot be Upload" });
    }

    const newProject = new Projects({
      name,
      title,
      description,
      hashtags,
      live_url,
      image: {
        secure_url: results.secure_url,
        public_id: results.public_id,
      },
    });

    newProject.save();

    if (newProject) {
      res.json({ success: true, message: "Project Uploaded" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const handleDeleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Projects.findById(id);

    if (!project) {
      return res.json({ success: false, message: "Project Not Exist" });
    }

    const deleteImage = await cloudinary.uploader.destroy(
      project.image.public_id
    );

    if (!deleteImage) {
      return res.json({ success: false, message: "Project Image not Deleted" });
    }

    const deletedProject = await Projects.findByIdAndDelete(id);

    if (deletedProject) {
      return res.json({
        success: true,
        message: `${project.name} has been deleted`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const handleEditProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, description, hashtags, live_url } = req.body;
    const file = req.files?.file;

    // ✅ Validate required fields
    if (!name || !title || !description || !hashtags || !live_url) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // ✅ Find existing project
    const existingProject = await Projects.findById(id);
    if (!existingProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const updateData = { name, title, description, hashtags, live_url };

    // ✅ Handle optional new image upload
    if (file) {
      // delete old image
      if (existingProject.image?.public_id) {
        await cloudinary.uploader.destroy(existingProject.image.public_id);
      }

      // upload new image
      const uploadRes = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "/projects",
      });

      updateData.image = {
        secure_url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      };
    }

    // ✅ Update and return new document
    const updatedProject = await Projects.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: file
        ? "Project details and image updated successfully."
        : "Project details updated successfully.",
      updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const handlePostReview = async (req, res) => {
  const { name, text, rating } = req.body;
  const file = req.files?.file;

  try {
    if (!name || !text || !rating) {
      return res.json({ success: false, message: "All Fields Are required" });
    }

    if (!file) {
      return res.json({ success: false, message: "Image is required" });
    }

    const results = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "/Reviews",
    });

    if (!results) {
      return res.json({ success: false, message: "Image cannot be uploaded" });
    }

    const newReview = new Reviews({
      name,
      text,
      rating,
      image: {
        secure_url: results.secure_url,
        public_id: results.public_id,
      },
    });

    newReview.save();

    if (newReview) {
      return res.json({ success: true, message: "Review Posted" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Intenal Server Error" });
  }
};

const handleDeleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteReview = await Reviews.findById(id);

    if (!deleteReview) {
      return res.json({ success: false, message: "Review Not Found" });
    }

    const results = await cloudinary.uploader.destroy(
      deleteReview.image.public_id
    );

    if (!results) {
      return res.json({
        success: false,
        message: "Review Image Cannot be deleted",
      });
    }

    const deletedReview = await Reviews.findByIdAndDelete(id);

    if (deletedReview) {
      return res.json({
        success: true,
        message: `Review of ${deleteReview.name} has been deleted`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const handleShowReviews = async (req, res) => {
  try {
    const allReviews = await Reviews.find({});
    return res.json({ success: true, allReviews });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  addPassword,
  verifyPassword,
  handleIsVerify,
  handleAddProject,
  handleDeleteProject,
  handleEditProject,
  handleShowProjects,
  handlePostReview,
  handleDeleteReview,
  handleShowReviews,
};
