const mongoose = require("mongoose");

const app = require("./app");
const { configs } = require("./configs");

const { mongoUrl, port } = configs;

mongoose.set("strictQuery", true);

mongoose
  .connect(mongoUrl)
  .then(
    app.listen(port, () => {
      console.log(`App listening on port ${port}!`);
    })
  )
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
