require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { google } = require("googleapis");

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // Make sure this file exists in your project
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getSheetsClient() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Railway!");
});

// Example API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Railway backend" });
});

// Google Sheets route (READ example)
app.get("/api/sheet", async (req, res) => {
  try {
    const sheets = await getSheetsClient();

    // Replace with your spreadsheet ID
    const spreadsheetId = process.env.SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Mauzo!A1:J", // Change to your sheet & range
    });

    res.json({ data: response.data.values });
  } catch (error) {
    console.error("❌ Google Sheets Error:", error);
    res.status(500).json({ error: "Failed to fetch data from Google Sheets" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
