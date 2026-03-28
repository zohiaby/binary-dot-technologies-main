require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const vehicleRoutes = require("./routes/vehicles");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow any Origin (reflects request Origin; works with credentials: true — cannot use '*')
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is required");
    process.exit(1);
  }
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log("CORS: all origins allowed (origin: true)");
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
