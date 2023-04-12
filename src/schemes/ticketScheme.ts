import mongoose from 'mongoose';
const ticketScheme = new mongoose.Schema({
    ownerID: String,
    channelName: String,
    channelID: String,
});
export default mongoose.model('Ticket', ticketScheme);
