const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const foodRoutes    = require("./routes/foodRoutes");
const mealLogRoutes = require("./routes/mealLogRoutes");
const waterRoutes   = require("./routes/waterRoutes");
const weightRoutes  = require("./routes/weightRoutes");
const sleepRoutes = require("./routes/sleepRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const postRoutes    = require("./routes/postRoutes");
const followRoutes  = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/workout-logs", workoutLogRoutes);
app.use("/api/foods",   foodRoutes);
app.use("/api/meals",   mealLogRoutes);
app.use("/api/water",   waterRoutes);
app.use("/api/weight",  weightRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/follow",   followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Health Corner API Running");
});

// 404 HANDLER — catches any request to a route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// GLOBAL ERROR HANDLER — catches anything thrown inside controllers
// Must have exactly 4 arguments for Express to treat it as an error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;