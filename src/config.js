module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/dungeons",
  JWT_SECRET: process.env.JWT_SECRET || "habittracker-jwt",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || "postgresql://postgres@localhost/dungeons",
};
