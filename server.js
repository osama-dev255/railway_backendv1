require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { google } = require("googleapis");

const app = express();

// Trust proxy (needed for express-rate-limit behind Railway / Heroku)
app.set("trust proxy", 1);

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
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
app.get("/", (_req, res) => {
  res.send("✅ Backend is running on Railway!");
});

// Example API
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Railway backend" });
});

// Google Sheets route (READ example)
app.get("/api/sheet", async (_req, res) => {
  try {
    const sheets = await getSheetsClient();

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
