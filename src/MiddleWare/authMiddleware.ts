const jwt = require("jsonwebtoken");

require("dotenv").config();
module.exports = function (req: any, res: any, next: any) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "User not authorized" });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
    next();
  } catch (e) {
    console.log(e);
    return res.status(403).json({ message: "User not authorized" });
  }
};
