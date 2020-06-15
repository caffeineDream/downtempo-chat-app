const formSwitchButtons = document.getElementsByClassName('form-switch');
const authForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

/* Switch login and register forms */
let shownForm = 0; // 0 — login form, 1 — registration form

const switchForms = () => {
    if ( shownForm == 0 ) {
        registerForm.classList.remove('display-none');
        authForm.classList.add('display-none');
        shownForm = 1;
    } else {
        authForm.classList.remove('display-none');
        registerForm.classList.add('display-none');
        shownForm = 0;
    }
};

for (var i = 0; i < formSwitchButtons.length; i++) {
    formSwitchButtons[i].addEventListener('click', switchForms, false);
};

/* Make login or register request with fetch */

const usernameInput = document.getElementById('login-username-input');
const passwordInput = document.getElementById('login-password-input');
const registerUsernameInput = document.getElementById('register-username-input');
const registerPasswordInput = document.getElementById('register-password-input');

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginData = { username: usernameInput.value, password: passwordInput.value };
    const authUrl = '/auth';
    sendCredentials(authUrl, loginData);
    usernameInput.value = '';
    passwordInput.value = '';
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const registerData = {"username": registerUsernameInput.value, "password": registerPasswordInput.value};
    const registerUrl = '/register';
    registerUser(registerUrl, registerData);
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
});

async function sendCredentials(url = '', data = {}) {
    try {
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.redirected) window.location.href = response.url;
            return response.json();
        })
        .then(data => {
            appendFeedback(data, 'login-form');
        });
    } catch (err) {
        console.log(err);
    };
};

async function registerUser(url = '', data = {}) {
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
        })
        .then(data => {
            appendFeedback(data, 'register-form');
        });
    } catch (err) {
        console.log(err);
    };
};

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