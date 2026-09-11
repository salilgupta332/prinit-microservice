
const express = require("express");

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "notification-service",
    status: "running"
  });
});

// Receive a notification from another service
app.post("/api/notifications", (req, res) => {
  const { message } = req.body;

  console.log("New notification received:", message);

  res.json({
    message: "Notification received successfully"
  });
});

app.listen(5002, () => {
  console.log("Notification Service running on port 5002");
});


async function processNextMessage() {
  try {
    // 1. Get the next message from the queue
    const response = await fetch(
      "http://localhost:5003/messages/next"
    );

    // No messages waiting
    if (response.status === 204) {
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to read message from queue");
    }

    const message = await response.json();

    // 2. Process the notification
    console.log(
      "Consumer received notification:",
      message.data.message
    );

    // 3. FAILURE SIMULATION
    if (message.data.subject === "FAIL TEST") {
      throw new Error(
        "Notification processing failed intentionally"
      );
    }

    // 4. Remove the message after successful processing
    const deleteResponse = await fetch(
      `http://localhost:5003/messages/${message.id}`,
      {
        method: "DELETE"
      }
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to acknowledge message");
    }

    console.log("Message processed successfully");

  } catch (error) {
    console.error(
      "Queue consumer error:",
      error.message
    );
  }
}

// Check the queue every 3 seconds
setInterval(processNextMessage, 3000);