const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");

// Load env
dotenv.config();
if (!process.env.MONGO_URL) {
    dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const inventoryModel = require("./models/inventoryModel");

// Org ID from logs
const ORG_ID = "6922ae4a3dae846e73b5a839";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to Mongodb Database ${mongoose.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Mongodb Database Error ${error}`.bgRed.white);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    console.log("Starting data seed for Org:", ORG_ID);

    // Generate records for last 180 days
    const records = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 180);
    const endDate = new Date();

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Randomly decide if transactions happened this day (70% chance)
        if (Math.random() > 0.3) {
            // Generate 1-5 transactions per day
            const numTransactions = Math.floor(Math.random() * 5) + 1;

            for (let i = 0; i < numTransactions; i++) {
                const bg = BLOOD_GROUPS[Math.floor(Math.random() * BLOOD_GROUPS.length)];

                // Random quantity 300-1000ml
                const quantity = Math.floor(Math.random() * 700) + 300;

                records.push({
                    inventoryType: "out",
                    bloodGroup: bg,
                    quantity: quantity,
                    email: "test_recipient@hospital.com", // Dummy email required by schema
                    organisation: ORG_ID,
                    hospital: ORG_ID, // Self-referencing or dummy ID for simplicity, schema requires it
                    createdAt: new Date(d), // Override creation time
                    updatedAt: new Date(d)
                });
            }
        }
    }

    try {
        console.log(`Inserting ${records.length} records...`);
        await inventoryModel.insertMany(records);
        console.log("Data seeding completed successfully!".bgGreen.white);
    } catch (error) {
        console.log(`Error seeding data: ${error}`.bgRed.white);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedData();
