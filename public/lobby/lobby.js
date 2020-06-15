const socket = io();
const chatPanel = document.getElementById('chat-panel');
const chatField = document.getElementById('chat-field');
const sendMessageForm = document.getElementById('send-message-form');
const sendMessageInput = document.getElementById('send-message-input');
const roomNameDesc = document.getElementById('room-name');

/* On socket events */
socket.on('connection-to-room', data => {
    chatPanel.style.display = 'flex';
    roomNameDesc.innerText = data.roomname;
    chatField.innerHTML = '';
    appendMessage(data.message, 'System');
});
socket.on('leaving-room', data => {
    chatPanel.style.display = 'none';
    roomNameDesc.innerText = '';
    chatField.innerHTML = '';
})
socket.on('message', data => {
    appendMessage(data.message, data.sender);
});
socket.on('new-room-created', data => {
    renderRoom(data, false);
});
socket.on('room-deleted', id => {
    removeRoom(id);
});
socket.on('user-connected-to-room', data => {
    appendMessage(`${data.username} has entered the room.`, 'System');
});
socket.on('user-left-room', data => {
    appendMessage(`${data.username} has left the room.`, 'System');
});
/* On socket events */

/* Chat panel script */
sendMessageForm.addEventListener('submit', e => {
    e.preventDefault();
    if (sendMessageInput.value) {
        const message = sendMessageInput.value;
        socket.send(message);
        appendMessage(message, 'You');
        sendMessageInput.value = '';
    };
});

function appendMessage(messageString, senderName) {
    /* Create message container and its' children */
    messageContainer = document.createElement('div');
    messageTag = document.createElement('div');
    message = document.createElement('div');
    /* Style elements */
    messageContainer.classList.add('message-container');
    messageTag.classList.add('message-tag');
    message.classList.add('message');
    /* Add content to message tag */
    let date = new Date;
    let timeStamp = `${date.getHours()}:${date.getMinutes()}`;
    messageTag.innerText = `${timeStamp} ${senderName}:`;
    /* Add content to message */
    message.innerText = messageString;
    /* Append elements */
    messageContainer.append(messageTag, message);
    chatField.prepend(messageContainer);
};

const leaveRoom = () => {
    socket.emit('leave-room');
};
/* Chat panel script */

/* Room interaction script */
const createRoomForm = document.getElementById('create-room-form');
const createRoomInput = document.getElementById('create-room-input');
const ownedRoomsContainer = document.getElementById('owned-rooms');
const allRoomsContainer = document.getElementById('all-rooms');

createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Send request
    const roomData = { "roomname": createRoomInput.value };
    const room = await createRoomQuery('/createRoom', roomData);
    // Render room
    if (!room.error) {
        renderRoom({ id: room.id, roomname: room.roomname}, true);
        socket.emit('new-room-created', room);
    };
    // Clear input
    createRoomInput.value = '';
});

async function createRoomQuery(url = '', data = {}) {
    try {
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            return response.json();
        });
    } catch (err) {
        console.log(err);
    };
};

async function deleteRoomQuery(url = '', data = {}) {
    try {
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            return response;
        });
    } catch (err) {
        console.log(err);
    };
}

const joinRoom = (room) => {
    const roomId = room.id;
    const roomName = room.dataset.name;
    socket.emit('join-room-query', { id: roomId, roomname: roomName });
};

const deleteRoom = async (e) => {
    e.stopPropagation();
    // Send request
    const roomId = e.target.parentNode.id;
    await deleteRoomQuery('/deleteRoom', { id: roomId});
    // Remove room
    removeRoom(roomId);
    socket.emit('room-deleted', roomId);
};

function renderRoom(data, own) {
    // Create room container
    roomDiv = document.createElement('div');
    roomDiv.setAttribute('id', data.id);
    roomDiv.setAttribute('data-name', data.roomname);
    roomDiv.setAttribute('onclick', 'joinRoom(this)');
    // Create room name tag
    roomNamePar = document.createElement('p');
    roomNamePar.classList.add('room-name');
    roomNamePar.innerText = data.roomname;
    roomDiv.append(roomNamePar);
    // Create delete button for owned rooms
    if (!own) {
        roomDiv.classList.add('room');
        allRoomsContainer.append(roomDiv);
    } else {
        roomDiv.classList.add('owned-room');
        deleteRoomButton = document.createElement('button');
        deleteRoomButton.classList.add('delete-room-button');
        deleteRoomButton.innerText = 'Delete';
        deleteRoomButton.setAttribute('onclick', 'deleteRoom(event)');
        roomDiv.append(deleteRoomButton);
        ownedRoomsContainer.append(roomDiv);
    };
};

function removeRoom(id) {
    document.getElementById(id).remove();
};
/* Room interaction script */
