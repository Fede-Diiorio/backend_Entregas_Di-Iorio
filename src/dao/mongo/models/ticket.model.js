import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
    },

    purchase_datetime: {
        type: Date,
        default: Date.now,
    },

    amount: Number,
    purchaser: String,
});

export default mongoose.model('Tickets', schema, 'tickets');
