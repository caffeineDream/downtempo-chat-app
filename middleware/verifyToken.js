const jwt = require('jsonwebtoken');
const signTokens = require('../utils/auth/signTokens');

function verifyToken(req, res, next) {
    /* Skip authorization and registration requests */
    if ( req.url === '/auth' || req.url === '/register' ) return next();

    /* Get tokens from request */
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    /* There are no tokens */
    if ( accessToken === undefined ) return res.render('auth', { data: {} });

    /* There are tokens */
    const accessStatus = jwt.verify(accessToken, process.env.TOKEN_SECRET, (error, payload) => {
        if ( error == null ) return payload;
        return error.name;
    });

    switch ( true ) {
        // Token is valid
        case typeof accessStatus === 'object':
            req.user = { id: accessStatus.id, username: accessStatus.username, type: accessStatus.type};
            return next();
        // Token has been tampered
        case accessStatus === 'JsonWebTokenError':
            res.status(401).render('auth', { data: { error: 'Invalid token!' } });
            return;
    };

    // accessStatus = 'TokenExpiredError', refresh token: 
    const refreshStatus = jwt.verify(refreshToken, process.env.REFRESH_SECRET, (error, payload) => {
        if ( error == null ) return payload;
        return error.name;
    })

    switch ( true ) {
        // Token is expired
        case refreshStatus === 'TokenExpiredError':
            res.status(401).render('auth', { data: { error: 'Session expired.' } });
            return; 
        // Token has been tampered
        case refreshStatus === 'JsonWebTokenError':
            res.status(401).render('auth', { data: { error: 'Invalid token!' } });
            return; 
    };
    // Refresh tokens here
    const newPayload = { id: refreshStatus.id, username: refreshStatus.username, type: refreshStatus.type };
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = signTokens(newPayload);
    // Set new tokens
    res.cookie('accessToken', newAccessToken).cookie('refreshToken', newRefreshToken);
    // Pass the request
    req.user = { id: refreshStatus.id, username: refreshStatus.username, type: refreshStatus.type };
    return next();
};

module.exports = verifyToken;