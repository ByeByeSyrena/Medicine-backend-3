const { Schema, model } = require("mongoose");
const { userRolesEnum } = require("../constants");
const handleMongooseError = require("../middlewares/handleMongooseError");
const bcrypt = require("bcrypt");

const pharmacySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: [true, "Pharmacy with this name already exists"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "User with this email already exists"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(userRolesEnum),
      default: userRolesEnum.ADMIN,
    },
  },
  { versionKey: false, timestamps: true }
);

pharmacySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

pharmacySchema.post("save", handleMongooseError);

pharmacySchema.methods.checkPassword = (candidate, hash) =>
  bcrypt.compare(candidate, hash);

const Pharmacy = model("Pharmacy", pharmacySchema);

module.exports = { Pharmacy };
