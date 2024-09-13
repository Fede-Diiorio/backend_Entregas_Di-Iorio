import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    products: [{

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products'
        },

        quantity: {
            type: Number,
            default: 0
        },
    }],
});

schema.virtual('id').get(function () {
    return this._id.toString();
});

export default mongoose.model('Carts', schema, 'carts');