import jwt from "jsonwebtoken";
import { genAccessToken } from "../utilities/tokenGeneration.js";

export const routeProtection = async (req, res, next) => {
  try {
    const token = req.cookies.BStoreUser;
    if (!token) {
      const refToken = req.cookies.BStoreRef;
      if (refToken) {
        const decoded = jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET);
        genAccessToken(decoded.userId, res);
        req.userId = decoded.userId;
        return res.status(200).json({ message: "Access token refreshed" });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
