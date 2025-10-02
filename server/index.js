// Simple Express server to handle email OTP and subscription payments
// NOTE: In production, store OTPs in a database / cache like Redis.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscription.js";
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/subscription", authMiddleware, subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
