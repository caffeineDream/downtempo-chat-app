const express = require('express');
const router = express.Router();
const Room = require('../model/Room');
const User = require('../model/User');

router.get('/', async (req, res) => {
    // Get all rooms available
    const allRooms = await Room.find();

    // Get user's rooms
    const user = await User.findById(req.user.id);
    let userRooms = user.ownedRooms;

    res.render('lobby', {
        clientData: {
            username: req.user.username,
            ownedRooms: userRooms
        },
        roomsData: allRooms
    });
});

module.exports = router;