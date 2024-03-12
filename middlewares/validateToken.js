// const { httpError } = require("../helpers");
// const { User } = require("../models");

// const validateToken = (req, res, next) => {
//   const refreshToken = req.cookies.jwt;

//   if (!refreshToken) {
//     return next(httpError(401, "Unauthorized"));
//   }

//   jwt.verify(refreshToken, refreshSecretKey, async (err, decoded) => {
//     if (err) {
//       return next(httpError(401, "Unauthorized"));
//     } else {
//       const { email } = decoded;
//       if (!email) throw httpError(401, "Unauthorized");

//       try {
//         const user = await User.findById(decoded._id);
//         if (!user) {
//           throw new Error("User not found");
//         }
//         req.user = user;
//         next();
//       } catch (error) {
//         return next(httpError(401, "Unauthorized"));
//       }
//     }
//   });
// };

// module.exports = validateToken;
