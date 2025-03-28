import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
    return await bcrypt.hash(password + "|" + process.env.SERVER_SIGNATURE, 10);
};
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password + "|" + process.env.SERVER_SIGNATURE , hash);
};