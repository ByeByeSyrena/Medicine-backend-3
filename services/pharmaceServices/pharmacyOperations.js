const { httpError } = require("../../helpers");
const { Pharmacy } = require("../../models");

async function createPharmacyInDB(data) {
  const { email, password, name } = data;

  if (await Pharmacy.exists({ email })) throw httpError(409, "Email in use");
  if (!name || !password) throw httpError(401, "Fill all the fields");

  const result = await Pharmacy.create({
    name,
    email,
    password,
  });

  result.password = undefined;
  return result;
}

module.exports = {
  createPharmacyInDB,
};
