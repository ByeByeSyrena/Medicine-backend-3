const { Schema, model } = require("mongoose");
const handleMongooseError = require("../middlewares/handleMongooseError");
const { userRolesEnum } = require("../constants");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "User with this email already exists"],
    },
    password: { type: String, required: true },
    roles: {
      type: [String],
      enum: Object.values(userRolesEnum),
      default: userRolesEnum.USER,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "newMedicine",
      },
    ],
    seller: {
      type: Schema.Types.ObjectId,
      ref: "newPharmacy",
      default: null,
    },
    refreshToken: {
      type: [String],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.post("save", handleMongooseError);

userSchema.methods.checkPassword = (candidate, hash) =>
  bcrypt.compare(candidate, hash);

const User = model("User", userSchema);

module.exports = { User };
