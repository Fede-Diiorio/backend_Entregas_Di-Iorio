import mongoose from 'mongoose';

const schema = new mongoose.Schema({

    firstName: String,
    lastName: String,
    age: Number,
    email: {
        type: String,
        unique: true,
    },

    password: {
        type: String,
    },

    rol: {
        type: String,
        default: 'user'
    },

    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carts'
    },

    last_connection: String,
    documents: [
        {
            name: String,
            reference: String
        }
    ],
    picture: String
});

export default mongoose.model('Users', schema, 'users');