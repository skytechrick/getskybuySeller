import jwt from 'jsonwebtoken';

const options = {
    expiresIn: '30d',
    issuer: 'gsb.in',
    audience: 'gsb.in',
    algorithm: 'HS256'
};

export const createToken = ( payload ) => {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

export const verifyToken = ( token ) => {
    return jwt.verify(token, process.env.JWT_SECRET, options);
}