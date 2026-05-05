import express from "express";
import path from "path";
import { setupSwagger } from "./configuration/swagger";
import vendorRouter from "./router/vendor";
import authRouter from "./router/auth";
import bookingRouter from "./router/booking";
import eventRouter from "./router/event";
import chatRouter from "./router/chat";
import feedbackRouter from "./router/feedback";
import guestRouter from "./router/guest";
import userRouter from "./router/user";
import serviceCategoryRouter from "./router/service-category";
import eventCategoryRouter from "./router/event-category";
import voiceCallRouter from "./router/voice-call";
const cors = require("cors");
const app = express();
app.use(cors()); 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/bookings", bookingRouter);
app.use("/api/chat", chatRouter);
app.use("/api/voice-calls", voiceCallRouter);

// Serve static files for uploads (QR codes, etc)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Initialize Swagger documentation
setupSwagger(app);

// Routes
app.use('/auth', authRouter);
app.use('/vendors', vendorRouter);
app.use('/events', eventRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/guests', guestRouter);
app.use('/users', userRouter);
app.use('/service-categories', serviceCategoryRouter);
app.use('/event-categories', eventCategoryRouter);

// Basic health check route
app.get("/", (req, res) => {
  res.json({
    message: "EventKonnect API is running",
    docs: "/api-docs",
  });
});

export default app;
