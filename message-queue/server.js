
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

const queueFile = path.join(__dirname, "messages.json");

// Create the queue file if it does not exist
if (!fs.existsSync(queueFile)) {
  fs.writeFileSync(queueFile, "[]");
}

function readMessages() {
  return JSON.parse(fs.readFileSync(queueFile, "utf8"));
}

function saveMessages(messages) {
  fs.writeFileSync(queueFile, JSON.stringify(messages, null, 2));
}

// Queue health check
app.get("/health", (req, res) => {
  res.json({
    service: "message-queue",
    status: "running"
  });
});

// Add a message to the queue
app.post("/messages", (req, res) => {
  const messages = readMessages();

  const message = {
    id: Date.now().toString(),
    data: req.body
  };

  messages.push(message);
  saveMessages(messages);

  console.log("Message added to queue:", message);

  res.status(201).json({
    message: "Message added to queue",
    id: message.id
  });
});

// Read the next waiting message
app.get("/messages/next", (req, res) => {
  const messages = readMessages();

  if (messages.length === 0) {
    return res.status(204).send();
  }

  res.json(messages[0]);
});

// Remove the first message after processing
app.delete("/messages/:id", (req, res) => {
  const messages = readMessages();

  const remainingMessages = messages.filter(
    (message) => message.id !== req.params.id
  );

  saveMessages(remainingMessages);

  res.json({
    message: "Message removed from queue"
  });
});

app.listen(5003, () => {
  console.log("Message Queue running on port 5003");
});