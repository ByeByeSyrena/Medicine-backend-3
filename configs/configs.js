const configs = {
  mongoUrl: process.env.DB_HOST,
  appName: process.env.PROJECT_NAME,
  port: process.env.PORT ? +process.env.PORT : 3000,
  environment: process.env.NODE_ENV ?? "development",
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  refreshSecretKey: process.env.TOKEN_HEADER_KEY,
};

module.exports = configs;
