import Faculty from "../models/Faculty.js";
import cloudinary from "../config/cloudinary.js";

// Upload utility for memory storage
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "idealab/faculties" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Get all faculties
// @route   GET /api/faculties
// @access  Public
export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({}).sort({ createdAt: 1 });
    res.json({ success: true, count: faculties.length, data: faculties });
  } catch (error) {
    console.error(`Error fetching faculties: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get single faculty
// @route   GET /api/faculties/:id
// @access  Public
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (faculty) {
      res.json({ success: true, data: faculty });
    } else {
      res.status(404).json({ success: false, message: "Faculty not found" });
    }
  } catch (error) {
    console.error(`Error fetching faculty: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Create a faculty
// @route   POST /api/faculties
// @access  Private/Admin
export const createFaculty = async (req, res) => {
  try {
    const { name, designation, department } = req.body;
    let photoUrl = "";

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      photoUrl = result.secure_url;
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "Photo is required" });
    }

    const faculty = new Faculty({
      name,
      photo: photoUrl,
      designation,
      department,
    });

    const createdFaculty = await faculty.save();
    res.status(201).json({ success: true, data: createdFaculty });
  } catch (error) {
    console.error(`Error creating faculty: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update a faculty
// @route   PUT /api/faculties/:id
// @access  Private/Admin
export const updateFaculty = async (req, res) => {
  try {
    const { name, designation, department } = req.body;

    const faculty = await Faculty.findById(req.params.id);

    if (faculty) {
      faculty.name = name || faculty.name;
      faculty.designation = designation || faculty.designation;
      faculty.department = department || faculty.department;

      if (req.file) {
        // Upload new photo
        const result = await streamUpload(req.file.buffer);
        faculty.photo = result.secure_url;
      }

      const updatedFaculty = await faculty.save();
      res.json({ success: true, data: updatedFaculty });
    } else {
      res.status(404).json({ success: false, message: "Faculty not found" });
    }
  } catch (error) {
    console.error(`Error updating faculty: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Delete a faculty
// @route   DELETE /api/faculties/:id
// @access  Private/Admin
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (faculty) {
      await Faculty.deleteOne({ _id: faculty._id });
      res.json({ success: true, message: "Faculty removed" });
    } else {
      res.status(404).json({ success: false, message: "Faculty not found" });
    }
  } catch (error) {
    console.error(`Error deleting faculty: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
