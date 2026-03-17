import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Upload utility
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "idealab/events" },
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

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { eventName, eventDate, description, location } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const event = await Event.create({
      eventName,
      eventDate,
      description,
      location,
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);
    await EventRegistration.deleteMany({ event: req.params.id });

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventName, eventDate, description, location } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.eventName = eventName || event.eventName;
    event.eventDate = eventDate || event.eventDate;
    event.description = description || event.description;
    event.location = location || event.location;

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      event.image = result.secure_url;
    }

    await event.save();
    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, year, branch, rollNo } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const alreadyRegistered = await EventRegistration.findOne({
      event: eventId,
      student: req.user._id,
    });

    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: "You are already registered" });
    }

    // Upload to Cloudinary if files exist
    let idCardRes = null;
    let regCopyRes = null;

    if (req.files && req.files.idCardPhoto) {
      idCardRes = await streamUpload(req.files.idCardPhoto[0].buffer);
    }
    if (req.files && req.files.registrationHardcopy) {
      regCopyRes = await streamUpload(req.files.registrationHardcopy[0].buffer);
    }

    const registration = await EventRegistration.create({
      event: eventId,
      student: req.user._id,
      studentDetails: { name, year, branch, rollNo },
      idCardPhoto: idCardRes ? idCardRes.secure_url : "",
      registrationHardcopy: regCopyRes ? regCopyRes.secure_url : "",
    });

    // Update Event and User
    event.registeredStudents.push(req.user._id);
    await event.save();

    const user = await User.findById(req.user._id);
    user.registeredEvents.push(eventId);
    await user.save();

    res.status(201).json({ success: true, registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ student: req.user._id })
      .populate("event", "eventName eventDate description")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate("event", "eventName")
      .populate("student", "name rollNo email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getEventRegistrationsByEventId = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate("student", "name rollNo email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
