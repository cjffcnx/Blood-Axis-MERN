const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      // Helpful explicit error so the developer knows which env var is missing
      throw new Error(
        'MONGO_URL environment variable is not set. Create a .env file with MONGO_URL or set the environment variable.'
      );
    }

    await mongoose.connect(mongoUrl);
    console.log(
      `Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta
        .white
    );
  } catch (error) {
    console.log(`Mongodb Database Error ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
