const io = require('socket.io')();
const jwt = require('jsonwebtoken');

io.on('connection', socket => {
    // Get user data of connected socket from jwt token
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return socket.disconnect(true);
    const refreshToken = parseCookie(cookie).refreshToken;
    let userInfo = jwt.verify(refreshToken, process.env.REFRESH_SECRET, (error, payload) => {
        if ( error == null ) return payload;
        socket.disconnect(true);
    });
    // On room creation
    socket.on('new-room-created', async data => {
        socket.broadcast.emit('new-room-created', { id: data.id, roomname: data.roomname });
    });
    socket.on('room-deleted', id => {
        // Drop all sockets from room by room Id
        io.of('/').in(id).clients((clients) => {
            if (!clients) return;
            // For each client in room:
            clients.forEach(clientId => {
                io.sockets.connected[clientId].leaveAll();
            });
         });
        socket.broadcast.emit('room-deleted', id);
        socket.broadcast.emit('current-room-deleted', id); // handle on client
    })
    // On joining room query
    socket.on('join-room-query', data => {
        // Tell 'i left' to previous room users
        if (userInfo.currentRoom) {
        io.sockets.to(userInfo.currentRoom).emit('user-left-room', { username: userInfo.username});
        };
        socket.leaveAll();
        socket.join(data.id);
        userInfo.currentRoom = data.id;
        socket.emit('connection-to-room', { message: `You connected to ${data.roomname} room.`, roomname: data.roomname});
        socket.broadcast.to(data.id).emit('user-connected-to-room', { username: userInfo.username});
    });
    // On leaving  room
    socket.on('leave-room', () => {
        const room = Object.keys(socket.rooms)[0];
        socket.broadcast.to(room).emit('user-left-room', { username: userInfo.username});
        socket.leaveAll();
        socket.emit('leaving-room');
    });
    // On user message
    socket.on('message', data => {
        const socketRoom = Object.keys(socket.rooms)[0];
        socket.broadcast.to(socketRoom).send({ message: data, sender: userInfo.username });
    });
    // On disconnect
    socket.on('disconnect', () => {
        if (userInfo.currentRoom) {
        io.sockets.to(userInfo.currentRoom).emit('user-left-room', { username: userInfo.username});
        };
    });
});

function parseCookie(cookie) {
    if (!cookie) return;
    // Remove spaces, divide into key+value strings inside array
    cookie = cookie.split('; ').join(';');
    cookie = cookie.split(' =').join('=');
    cookie = cookie.split(';');

    let object = {};

    // Populate object with keys and values
    for ( let i = 0; i < cookie.length; i++ ) {
        cookie[i] = cookie[i].split('=');
        object[cookie[i][0]] = cookie[i][1];
    };

    return object;
};

module.exports = io;