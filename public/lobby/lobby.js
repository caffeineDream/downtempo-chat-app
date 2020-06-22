const socket = io();
const chatPanel = document.getElementById('chat-panel');
const chatField = document.getElementById('chat-field');
const roomsPanel = document.getElementById('rooms-panel');
const sendMessageForm = document.getElementById('send-message-form');
const sendMessageInput = document.getElementById('send-message-input');
const roomNameDesc = document.getElementById('room-name');
const amOnline = document.getElementById('amOnline');
const createRoomForm = document.getElementById('create-room-form');
const createRoomInput = document.getElementById('create-room-input');
const ownedRoomsContainer = document.getElementById('owned-rooms');
const allRoomsContainer = document.getElementById('all-rooms');
let previousRoom;

/* On socket events */
socket.on('connect', () => {
    amOnline.style.color = '#B5F44A';
});
socket.on('disconnect', () => {
    amOnline.style.color = '#DB504A';
})
socket.on('connection-to-room', data => {
    chatPanel.style.animationName = 'appear';
    chatPanel.style.display = 'flex';
    chatField.style.opacity = 1;
    roomNameDesc.innerText = data.roomname;
    chatField.innerHTML = '';
    appendMessage(data.message, 'System');
});
socket.on('leaving-room', () => {
    resetChatField();
    // Reset room styles
    if (previousRoom) {
        previousRoom.style.boxShadow = 'none';
        previousRoom.setAttribute('onclick', 'joinRoom(this)');
    };
})
socket.on('message', data => {
    appendMessage(data.message, data.sender);
});
socket.on('new-room-created', data => {
    renderRoom(data, false);
});
socket.on('room-deleted', roomId => {
    removeRoom(roomId);
});
socket.on('current-room-deleted', roomId => {
    resetChatField();
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
    let timeStamp = date.toTimeString().substring(0, 5);
    messageTag.innerText = `${timeStamp} ${senderName}:`;
    /* Add content to message */
    message.innerText = messageString;
    /* Append elements */
    messageContainer.append(messageTag, message);
    chatField.prepend(messageContainer);
};

function resetChatField() {
    chatPanel.style.display = 'none';
    roomNameDesc.innerText = '';
    chatField.innerHTML = '';
};

const leaveRoom = () => {
    socket.emit('leave-room');
};
/* Chat panel script */

/* Room interaction script */
createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Send request
    const roomData = { "roomname": createRoomInput.value };
    const response = await createRoomQuery('/createRoom', roomData);
    // Render room
    if (!response.error) {
        renderRoom({ id: response.id, roomname: response.roomname}, true);
        socket.emit('new-room-created', response);
    };
    // Give feedback to the client
    appendFeedback(response, 'owned-rooms');
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
            return response.json();
        });
    } catch (err) {
        console.log(err);
    };
}

const joinRoom = (room) => {
    socket.emit('join-room-query', { id: room.id, roomname: room.dataset.name });
    // Style previous and now-active rooms
    if (previousRoom) {
        previousRoom.style.boxShadow = 'none';
        previousRoom.setAttribute('onclick', 'joinRoom(this)');
    };
    previousRoom = room;
    room.style.boxShadow = '1.5px 1.5px 1px 0px #03E9F4';
    room.removeAttribute('onclick');
};

const deleteRoom = async (e) => {
    e.stopPropagation();
    // Send request
    const roomId = e.currentTarget.parentNode.id;
    const response = await deleteRoomQuery('/deleteRoom', { id: roomId});
    // Remove room from the page
    if (!response.error) {
        removeRoom(roomId);
        resetChatField();
        socket.emit('room-deleted', roomId);
    };
    // Give feedback to the client
    appendFeedback(response, 'owned-rooms');
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
        deleteRoomButton.innerText = '<i class="fa fa-times" aria-hidden="true"></i>';
        deleteRoomButton.setAttribute('onclick', 'deleteRoom(event)');
        deleteRoomButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
        roomDiv.append(deleteRoomButton);
        ownedRoomsContainer.append(roomDiv);
    };
};

function removeRoom(id) {
    const room = document.getElementById(id);
    room.style.animationName = 'disappear';
    room.style.animationTimingFunction = 'linear';
    setTimeout(function() {
        room.remove();
    }, 1000);
};
/* Room interaction script */

/* Room filter script */
const findRoomsForm = document.getElementById('find-rooms-form');
const findRoomsInput = document.getElementById('find-rooms-input');
const findRoomsButton = document.getElementById('find-rooms-button');
const closeResultsButton = document.getElementById('close-results-button');

findRoomsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Delete previus result
    let prevResult = document.getElementById('filtered-rooms');
    if (prevResult) prevResult.remove();
    // Get all existing rooms and search input
    const nodeList = allRoomsContainer.querySelectorAll('.room');
    const searchInput = findRoomsInput.value;
    findRoomsInput.value = '';
    // Populate roomList with id-roomname pairs
    const roomList = [];
    for (let i = 0; i < nodeList.length; i++) {
        let room = {};
        room.id = nodeList[i].id
        room.roomname = nodeList[i].querySelector('.room-name').innerText;
        roomList.push(room);
    };
    // Filter room list by search input
    let filteredRoomsList = roomList.filter(room => {
        const matches = room.roomname.match(searchInput);
        return !!matches;
    });
    // Create container for filtered rooms
    allRoomsContainer.style.display = 'none';
    const resultContainer = document.createElement('div');
    resultContainer.id = 'filtered-rooms';
    resultContainer.draggable = 'true';
    resultContainer.addEventListener('dragend', () => {
        // Remove results, get back all rooms container
        resultContainer.remove();
        allRoomsContainer.style.animation = 'none';
        allRoomsContainer.style.display = 'flex';
        // Get back find rooms button, hide itself
        findRoomsButton.style.display = 'inline-block';
        closeResultsButton.style.display = 'none';
    });
    roomsPanel.prepend(resultContainer);
    // Populate container
    filteredRoomsList.forEach(room => {
        renderFilteredRoom(room, resultContainer)
    });
    // Swap find button with close results button
    findRoomsButton.style.display = 'none';
    closeResultsButton.style.display = 'inline-block';
});

closeResultsButton.addEventListener('click', function() {
    // Remove results, get back all rooms container
    let result = document.getElementById('filtered-rooms');
    result.remove();
    allRoomsContainer.style.animation = 'none';
    allRoomsContainer.style.display = 'flex';
    // Get back find rooms button, hide itself
    findRoomsButton.style.display = 'inline-block';
    this.style.display = 'none';
});

function renderFilteredRoom (data, target) {
    // Create room container
    roomDiv = document.createElement('div');
    roomDiv.setAttribute('id', data.id);
    roomDiv.setAttribute('data-name', data.roomname);
    roomDiv.setAttribute('onclick', 'joinRoom(this)');
    roomDiv.classList.add('room');
    // Create room name tag
    roomNamePar = document.createElement('p');
    roomNamePar.classList.add('room-name');
    roomNamePar.innerText = data.roomname;
    roomDiv.append(roomNamePar);
    // Append room to target container
    target.append(roomDiv);
};
/* Room filter script */

function appendFeedback(data, target) {
    let targetContainer = document.getElementById(target);
    let popup = document.createElement('div');
    popup.classList.add('pop-up');
    if (data.error) {
        popup.style.color = '#FB3640';
    } else popup.style.color = '#419D78';
    popup.innerText = data.feedback;
    targetContainer.appendChild(popup);
    // Fade it out after 3s
    setTimeout(() => {
        popup.style.opacity = 0;
    }, 2750);
    setTimeout(() => {
        popup.remove();
    }, 3000);
};