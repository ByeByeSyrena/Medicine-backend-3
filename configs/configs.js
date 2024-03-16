const configs = {
  mongoUrl: process.env.DB_HOST,
  appName: process.env.PROJECT_NAME,
  port: process.env.PORT ? +process.env.PORT : 3000,
  environment: process.env.NODE_ENV ?? "development",
  accessTokenKey: process.env.ACCESS_TOKEN_KEY,
  refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
};

module.exports = configs;
