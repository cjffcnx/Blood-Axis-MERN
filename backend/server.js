const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
const { initializeScheduler } = require("./routes/schedulerRoutes");
// dotconfig - explicitly resolve .env located two levels up (workspace root)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

//mongodb connection
connectDB();

// Initialize forecast scheduler
const FORECAST_SCHEDULE = process.env.FORECAST_SCHEDULE || "0 2 * * *"; // 2 AM daily by default
initializeScheduler(FORECAST_SCHEDULE);

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
// 1 test route
app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/admin/scheduler", require("./routes/schedulerRoutes").router);
app.use("/api/v1/request", require("./routes/requestRoutes"));
app.use("/api/v1/blood-request", require("./routes/bloodRequestRoutes"));
app.use("/api/blood-request", require("./routes/bloodRequestRoutes"));
app.use("/api/v1/account-requests", require("./routes/accountRequestRoutes"));
app.use("/api/v1/donor-interest", require("./routes/donorInterestRoutes"));
app.use("/api/v1/esewa", require("./routes/esewaRoutes"));
app.use("/api/v1/forecasting", require("./routes/forecastingRoutes"));
app.use("/api/v1/contact", require("./routes/contactRoutes"));

// Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} ModeOn Port ${process.env.PORT}`
      .bgBlue.white
  );
});
