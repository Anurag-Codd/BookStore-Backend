import jwt from "jsonwebtoken";

export const genAccessToken = (userId, res) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    res.cookie("bookStoreUser", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: "strict",
    });
};

export const genRefreshToken = (userId, res) => {
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("bookStoreRefresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
    });
};