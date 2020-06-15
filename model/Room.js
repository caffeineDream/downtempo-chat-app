const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomname: {
        type: String,
        required: true,
        max: 24,
        min: 4
    },
    owner: {
        type: Object
    }
});

module.exports = mongoose.model('Room', roomSchema);