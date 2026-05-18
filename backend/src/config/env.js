const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const appEnv = process.env.APP_ENV || "DEV";
const envFileName = appEnv === "PROD" ? ".env.prod" : ".env.dev";
const envFilePath = path.resolve(process.cwd(), envFileName);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

module.exports = {
  appEnv,
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
