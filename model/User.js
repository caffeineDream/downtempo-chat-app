const mongoose = require('mongoose');

/* Create user schema and model */
const userSchema = new mongoose.Schema({    
    username: {
        type: String,
        required: true,
        max: 16,
        min: 4
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 4
    },
    type: {
        type: String,
        default: 'user'
    },
    ownedRooms: {
        type: Array
    }
});



module.exports = mongoose.model('User', userSchema);