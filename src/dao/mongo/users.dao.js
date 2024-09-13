import { Users } from './models/index.js';

export default class UserDAO {
    async findByEmail(email) {
        return await Users.findOne({ email });
    };

    async create(user) {
        return await Users.create(user);
    };

    async updatePassword(email, password) {
        return await Users.updateOne({ email }, { $set: { password } });
    };

    async updateRole(email, rol) {
        return await Users.updateOne({ email }, { $set: { rol } });
    };

    async deleteByEmail(email) {
        return await Users.deleteOne({ email });
    };

    async findById(id) {
        return await Users.findOne({ _id: id });
    };

    async findAll() {
        return await Users.find();
    };

    async lastConnection(email, last_connection) {
        return await Users.updateOne({ email }, { $set: { last_connection } })
    };

    async updateDocuments(id, documents) {
        return await Users.findByIdAndUpdate(id, { $set: { documents } });
    };

    async updatePicture(id, picture) {
        return await Users.findByIdAndUpdate(id, { $set: { picture } })
    };
};