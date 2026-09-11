
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Gateway health check
app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running"
  });
});

// Forward assignment requests
app.use(
  "/api/assignments",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/": "/api/assignments"
    }
  })
);

// Forward notification requests
app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: {
      "^/": "/api/notifications"
    }
  })
);

// Start the gateway
app.listen(5000, () => {
  console.log("API Gateway running on port 5000");
});