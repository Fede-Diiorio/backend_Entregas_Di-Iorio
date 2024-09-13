import { Tickets } from './models/index.js';

export default class TicketDAO {

    async getTickets() {
        return await Tickets.find();
    };

    async getTicketById(id) {
        return await Tickets.findById(id);
    };

    async addTicket(data) {
        return await Tickets.create(data);
    };

    async updateTicket(id, data) {
        return await Tickets.updateOne({ _id: id }, { $set: data });
    };

    async deleteTicket(id) {
        return await Tickets.deleteOne({ _id: id });
    };
};