import bcrypt from 'bcrypt';

export const hashPassword = value => bcrypt.hashSync(value, bcrypt.genSaltSync(10));

export const isValidPassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);