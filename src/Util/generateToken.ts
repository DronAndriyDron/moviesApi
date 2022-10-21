require('dotenv').config()
const jwt = require('jsonwebtoken');

export const generateAccessToken = (id: number, email: string) => {
    const payload = {
        id,
        email
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "24h"})
}