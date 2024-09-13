import { Carts } from './models/index.js';

export default class CartDAO {

    async getCarts() {
        return await Carts.find();
    };

    async getCartById(id) {
        return await Carts.findOne({ _id: id }).populate('products.product');
    };

    async addCart(cart) {
        return await Carts.create(cart);
    };

    async updateCart(id, data, action = '$set') {
        const updateData = { [action]: data };
        return await Carts.updateOne({ _id: id }, updateData);
    };

    async deleteCart(id) {
        return await Carts.deleteOne({ _id: id });
    };
};