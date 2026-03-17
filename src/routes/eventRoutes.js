import express from "express";
import {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  registerForEvent,
  getMyEvents,
  getEventRegistrations,
  getEventRegistrationsByEventId,
} from "../controllers/eventController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public / Student Routes
router.get("/", getEvents);
router.post(
  "/:id/register",
  protect,
  upload.fields([{ name: "idCardPhoto", maxCount: 1 }, { name: "registrationHardcopy", maxCount: 1 }]),
  registerForEvent
);
router.get("/my-events", protect, getMyEvents);

// Admin Routes
router.post("/create", protect, admin, upload.single("image"), createEvent);
router.delete("/:id", protect, admin, deleteEvent);
router.put("/:id", protect, admin, upload.single("image"), updateEvent);
router.get("/:id/registrations", protect, admin, getEventRegistrationsByEventId);
router.get("/registrations", protect, admin, getEventRegistrations);

export default router;
