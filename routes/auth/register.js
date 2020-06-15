const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../model/User');
const { inputValidation } = require('../../utils/validation');

/* Middleware */
router.use(express.json());

/* Register new user */
router.post('/register', async (req, res) => {
    /* Validate register data input */
    const {error} = inputValidation(req.body);
    if (error) return res.status(400).send({ error: true, feedback: error.details[0].message });

    /* Check if username is unique */
    const usernameExists = await User.findOne({ username: req.body.username});
    if (usernameExists) return res.status(400).send({ error: true, feedback: 'Username is taken :(' });

    /* Hash the password and create new User */
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
        username: req.body.username,
        password: hashedPassword,
        group: 'user'
    });

    /* Save new User to the database */
    try {
        await user.save();
        res.status(200).send({ error: false, feedback: 'Registration successful.' });
    } catch (err) {
        res.status(401).send({ error: true, feedback: 'Something went wrong, try again.' });
    }
});

module.exports = router;