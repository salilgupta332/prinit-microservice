
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const Assignment = require("./models/Assignment");

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "assignment-service",
    status: "running"
  });
});

// Get all assignments
app.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find();

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assignments"
    });
  }
});

// Create a new assignment


/* Create a new assignment */
app.post("/api/assignments", async (req, res) => {
  try {
    // 1. Save the assignment in MongoDB
    const assignment = await Assignment.create(req.body);

    // 2. Send a notification message to the Message Queue
    try {
      const queueResponse = await fetch(
        "http://localhost:5003/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `New PRINTit assignment created: ${assignment.subject}`,
            assignmentId: assignment._id.toString()
          })
        }
      );

      if (!queueResponse.ok) {
        console.log("Message Queue returned an error");
      } else {
        console.log("Notification message added to queue");
      }
    } catch (queueError) {
      console.error(
        "Message Queue is unavailable:",
        queueError.message
      );
    }

    // 3. Return the saved assignment
    res.status(201).json(assignment);

  } catch (error) {
    console.error("Assignment creation failed:", error.message);

    res.status(400).json({
      message: error.message
    });
  }
});

// Connect to MongoDB, then start the service
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(
        `Assignment Service running on port ${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();