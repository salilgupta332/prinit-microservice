
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    subject: {
      type: String,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
    contentType: {
      type: String,
      enum: ["we_provide", "student_upload"],
      required: true
    },
    instructions: {
      type: String
    },
    price: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: [
        "requested",
        "in-progress",
        "completed",
        "delivered"
      ],
      default: "requested"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Assignment",
  assignmentSchema
);