const logger = require("morgan");
const cors = require("cors");

const express = require("express");

require("dotenv").config();

const app = express();

// const test = require("./routers");
const { configs } = require("./configs");
const { URL_PREFIX } = require("./constants");
const { globalErrorHandler } = require("./helpers");
const { userRouter } = require("./routers");
const { environment } = configs;
const cookieParser = require("cookie-parser");
const { urlencoded } = require("express");

const formatsLogger = process.env.NODE_ENV === "development" ? "dev" : "short";

if (environment === "development") {
  app.use(logger(formatsLogger));
}
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// app.use(`${URL_PREFIX}/medicines`, medicineRouter);
// app.use(`${URL_PREFIX}/pharmacies`, pharmaciesRouter);
// app.use(`${URL_PREFIX}/orders`, ordersRouter);
app.use(`${URL_PREFIX}/users`, userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(globalErrorHandler);

module.exports = app;
