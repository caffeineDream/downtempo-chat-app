const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    res.clearCookie('accessToken').clearCookie('refreshToken').redirect(303, '/');
});

module.exports = router;