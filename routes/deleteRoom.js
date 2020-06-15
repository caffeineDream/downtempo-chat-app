const express = require('express');
const router = express.Router();
const Room = require('../model/Room');
const User = require('../model/User');

/* Middleware */
router.use(express.json());

/* Delete room by id */
router.post('/deleteRoom', async (req, res) => {

    const roomId = req.body.id
    const room = await Room.findById(roomId);
    const user = await User.findById(room.owner.id)

    try {
        // Delete room by id
        await Room.deleteOne({ _id: roomId });
        try {
            // Delete room from user's owned rooms
            for (let i = 0; i < user.ownedRooms.length; i++) {
                if (user.ownedRooms[i].id == roomId) {
                    user.ownedRooms.splice(i, 1);
                };
            };
            // Save user
            await user.save();

            res.status(200).send('done');
        } catch (err) {
            res.status(500).send(err);
        };
    } catch (err) {
        res.status(500).send(err);
    };
});

module.exports = router;