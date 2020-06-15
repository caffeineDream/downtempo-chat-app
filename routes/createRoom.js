const express = require('express');
const router = express.Router();
const Room = require('../model/Room');
const User = require('../model/User');

/* Middleware */
router.use(express.json());

/* Create new room */
router.post('/createRoom', async (req, res) => {
    // Check if room name is unique
    const roomNameExists = await Room.findOne({ roomname: req.body.roomname});
    if (roomNameExists) return res.status(400).send({ error: true, feedback: 'Name is taken :(' });
    // Create new Room
    const room = new Room({
        roomname: req.body.roomname,
        owner: {
            username: req.user.username,
            id: req.user.id
        }
    });
    try {
        // Save room to the database
        const savedRoom = await room.save();
        // Link room to owner
        const user = await User.findById(req.user.id);
        user.ownedRooms.push({ id: savedRoom.id, roomname: savedRoom.roomname})
        await user.save();
        res.status(200).send({ error: false, feedback: 'Room was created.', id: savedRoom._id, roomname: savedRoom.roomname });
    } catch (err) {
        res.status(500).send({ error: true, feedback: err });
    };
});

module.exports = router;