const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
// dotconfig - explicitly resolve .env located one level up (project root)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//mongodb connection
connectDB();

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
app.use("/api/v1/request", require("./routes/requestRoutes"));
app.use("/api/v1/account-requests", require("./routes/accountRequestRoutes"));

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
