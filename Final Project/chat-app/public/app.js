let myUsername = "";
let currentRoom = "Global";
const roomMessages = {};
while (!myUsername) {
  myUsername = prompt("Please enter your name")?.trim();
}
const userColors = {};
function getUserColor(username) {
  if (!userColors[username]) {
    userColors[username] = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
  }
  return userColors[username];
}
const url = new URL(`./start_web_socket?username=${myUsername}`, location.href);
url.protocol = url.protocol.replace("http", "ws");
const socket = new WebSocket(url);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.event) {
    case "update-users":
      updateUserList(data.usernames);
      break;

    case "send-message":
      addMessage(data.username, data.message);
      break;

    case "new-poll":
      displayPoll(data.pollId, data.question, data.options, data.allowMultiple, data.timer, data.creator);
      break;

    case "poll-vote":
      updatePollVotes(data.pollId, data.votes);
      break;

    case "poll-closed":
      disablePoll(data.pollId, data.closedBy === myUsername);
      break;

    case "update-rooms":
      updateRoomList(data.rooms);
      break;

    case "join-room-success":
      document.getElementById("current-room-title").textContent = `Room: ${data.room}`;
      currentRoom = data.room;

      const conversation = document.getElementById("conversation");
      conversation.innerHTML = "";

      if (roomMessages[currentRoom]) {
        for (const msg of roomMessages[currentRoom]) {
          conversation.appendChild(msg.cloneNode(true));
        }
      }

      if (data.room !== "Global") {
        document.getElementById("leave-room-button").classList.remove("hidden");
      } else {
        document.getElementById("leave-room-button").classList.add("hidden");
      }
      break;

    case "join-room-failed":
      alert(`Gagal join room: ${data.message}`);
      break;

    case "leave-room-success":
      document.getElementById("current-room-title").textContent = "Room: Global";
      currentRoom = "Global";
      const convo = document.getElementById("conversation");
      convo.innerHTML = "";

      if (roomMessages["Global"]) {
        for (const msg of roomMessages["Global"]) {
          convo.appendChild(msg.cloneNode(true));
        }
      }

      document.getElementById("leave-room-button").classList.add("hidden");
      break;

    case "room-deleted":
      if (currentRoom === data.roomName) {
        alert(`Room "${data.roomName}" telah dihapus oleh pembuatnya.`);
        document.getElementById("current-room-title").textContent = "Room: Global";
        currentRoom = "Global";
        document.getElementById("conversation").innerHTML = "";

        if (roomMessages["Global"]) {
          for (const msg of roomMessages["Global"]) {
            document.getElementById("conversation").appendChild(msg.cloneNode(true));
          }
        }

        document.getElementById("leave-room-button").classList.add("hidden");
      }
      break;

  }
};

function updateUserList(usernames) {
  const userList = document.getElementById("users");
  userList.replaceChildren();

  for (const username of usernames) {
    const listItem = document.createElement("li");
    listItem.textContent = username;
    userList.appendChild(listItem);
  }
}

function updateRoomList(rooms) {
  const roomList = document.getElementById("rooms");
  roomList.innerHTML = "";

  for (const room of rooms) {
    const li = document.createElement("li");

    const roomTitle = document.createElement("strong");
    roomTitle.textContent = room.name + (room.private ? " 🔒" : "");

    const creatorInfo = document.createElement("small");
    creatorInfo.style.display = "block";
    creatorInfo.style.fontSize = "0.75em";
    creatorInfo.textContent = `Pembuat: ${room.creator}`;
    roomTitle.appendChild(creatorInfo);

    const userList = document.createElement("ul");
    userList.style.marginLeft = "1em";
    userList.style.fontSize = "0.9em";

    if (room.users && room.users.length > 0) {
      for (const user of room.users) {
        const userItem = document.createElement("li");
        userItem.textContent = user;
        userList.appendChild(userItem);
      }
    } else {
      const userItem = document.createElement("li");
      userItem.textContent = "(tidak ada pengguna)";
      userList.appendChild(userItem);
    }

    li.appendChild(roomTitle);
    li.appendChild(userList);

    li.dataset.room = room.name;
    li.dataset.private = room.private;

    if (room.creator === myUsername) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Hapus Room";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Cegah join saat klik tombol
        const confirmed = confirm(`Apakah Anda yakin ingin menghapus room "${room.name}"?`);
        if (confirmed) {
          socket.send(JSON.stringify({
            event: "delete-room",
            roomName: room.name
          }));
        }
      });

      li.appendChild(deleteBtn);
    }

    li.addEventListener("click", () => {
      const isPrivate = room.private;
      let password = "";

      if (isPrivate) {
        password = prompt(`Masukkan password untuk room "${room.name}":`)?.trim();
        if (!password) return;
      }

      socket.send(JSON.stringify({
        event: "join-room",
        room: room.name,
        password
      }));
    });

    roomList.appendChild(li);
  }
}

function addMessage(username, message) {
  const template = document.getElementById("message");
  const clone = template.content.cloneNode(true);
  const messageDiv = clone.querySelector("div");
  const nameSpan = clone.querySelector("span");
  const messageP = clone.querySelector("p");

  const isSelf = username === myUsername;
  const convo = document.getElementById("conversation");
  convo.scrollTop = convo.scrollHeight;

  messageDiv.classList.add(isSelf ? "self-message" : "other-message");
  messageDiv.style.backgroundColor = getUserColor(username);

  nameSpan.textContent = username;
  nameSpan.style.color = getUserColor(username);
  messageP.textContent = message

  if (!roomMessages[currentRoom]) {
    roomMessages[currentRoom] = [];
  }
  const finalMessageNode = clone;
  roomMessages[currentRoom].push(finalMessageNode);

  const currentRoomName = document.getElementById("current-room-title").textContent.replace("Room: ", "");
  if (currentRoom === currentRoomName) {
    document.getElementById("conversation").appendChild(clone.cloneNode(true));
  }
}

const inputElement = document.getElementById("data");
inputElement.focus();

const form = document.getElementById("form");

form.onsubmit = (e) => {
  e.preventDefault();
  const message = inputElement.value;
  inputElement.value = "";
  socket.send(JSON.stringify({
    event: "send-message",
    message,
    room: currentRoom
  }));
};

const roomForm = document.getElementById("create-room-form");
const roomNameInput = document.getElementById("room-name");
const isPrivateCheckbox = document.getElementById("is-private-room");
const passwordInput = document.getElementById("room-password");
const pollSection = document.getElementById('polling');
const backButton = document.getElementById("back-button");
const attachmentBtn = document.getElementById('attachment-button');
const attachmentMenu = document.getElementById('attachment-menu');
const attachmentPoll = document.getElementById('attachment-poll');
const addOptionBtn = document.getElementById('add-option');
const pollOptions = document.getElementById('poll-options');
const pollForm = document.getElementById('poll-form');
const pollDisplay = document.getElementById('poll-display');
const timerInput = document.getElementById("poll-timer");

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomName = roomNameInput.value.trim();
  const isPrivate = isPrivateCheckbox.checked;
  const password = isPrivate ? passwordInput.value.trim() : null;

  if (roomName) {
    socket.send(JSON.stringify({
      event: "create-room",
      roomName,
      isPrivate,
      password
    }));

    roomNameInput.value = "";
    isPrivateCheckbox.checked = false;
    passwordInput.classList.add("hidden");
    passwordInput.removeAttribute("required");
    passwordInput.value = "";
  }
});

isPrivateCheckbox.addEventListener("change", () => {
  if (isPrivateCheckbox.checked) {
    passwordInput.classList.remove("hidden");
    passwordInput.setAttribute("required", "required");
  } else {
    passwordInput.classList.add("hidden");
    passwordInput.removeAttribute("required");
    passwordInput.value = "";
  }
});

attachmentBtn.addEventListener('click', () => {
  attachmentMenu.classList.toggle('hidden');
});

attachmentPoll.addEventListener('click', () => {
  pollSection.classList.remove('hidden');
  attachmentMenu.classList.add('hidden');
});

backButton.addEventListener("click", () => {
  pollSection.classList.add("hidden");
  document.getElementById("conversation").style.display = "flex";
});

addOptionBtn.addEventListener('click', () => {
  const inputWrapper = document.createElement('div');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'option';
  input.placeholder = `Opsi ${pollOptions.children.length + 1}`;
  input.required = true;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.type = 'button';
  deleteBtn.classList.add('delete-option');

  deleteBtn.addEventListener('click', () => {
    inputWrapper.remove();
  });

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(deleteBtn);
  pollOptions.appendChild(inputWrapper);
});

pollForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const question = document.getElementById('poll-question').value;
  const optionInputs = pollOptions.querySelectorAll('input[name="option"]');
  const options = Array.from(optionInputs).map(input => input.value).filter(Boolean);
  const allowMultiple = document.getElementById("multi-vote-mode").checked;
  const days = parseInt(document.getElementById('poll-days').value, 10) || 0;
  const hours = parseInt(document.getElementById('poll-hours').value, 10) || 0;
  const minutes = parseInt(document.getElementById('poll-minutes').value, 10) || 0;
  const seconds = parseInt(document.getElementById('poll-seconds').value, 10) || 0;

  const timer = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;

  const pollId = `poll-${Date.now()}`; 
  socket.send(JSON.stringify({
    event: 'create-poll',
    pollId,
    question,
    options,
    allowMultiple,
    timer
  }));

  pollForm.reset();
  pollOptions.innerHTML = `
    <input type="text" name="option" placeholder="Opsi 1" required />
    <input type="text" name="option" placeholder="Opsi 2" required />
  `;
  pollSection.classList.add('hidden');
});

const votedOptions = {};

function displayPoll(pollId, question, options, allowMultiple = false, timer = 0, creator = "") {
  const isCreator = creator === myUsername;
  const pollMessage = `
    ${question}<br>
    ${options.map(opt => `<button class="poll-option" data-poll-id="${pollId}" data-option="${opt}">${opt}</button>`).join('')}
    ${timer > 0 ? `<p id="timer-${pollId}" class="poll-timer">Sisa waktu: ${formatTime(timer)}</p>` : ''}
    ${isCreator ? `<button class="close-poll" data-poll-id="${pollId}">Tutup Polling</button>` : ''}
  `;
  const template = document.getElementById("message");
  const clone = template.content.cloneNode(true);
  const messageDiv = clone.querySelector("div");
  const nameSpan = clone.querySelector("span");
  const messageP = clone.querySelector("p");

  messageDiv.classList.add("poll-message");
  nameSpan.textContent = "Polling";
  messageP.innerHTML = pollMessage;

  document.getElementById("conversation").appendChild(clone);

  if (!votedOptions[pollId]) votedOptions[pollId] = new Set();

  const buttons = document.querySelectorAll(`button.poll-option[data-poll-id="${pollId}"]`);

  buttons.forEach(btn => {
    const selectedOption = btn.getAttribute('data-option');
    btn.addEventListener('click', () => {
      const userVotes = votedOptions[pollId];
      const hasVoted = userVotes.has(selectedOption);
      if (hasVoted) {
        userVotes.delete(selectedOption);
        socket.send(JSON.stringify({ event: 'unvote', pollId, selectedOption }));
      } else {
        if (!allowMultiple && userVotes.size > 0) return;
        userVotes.add(selectedOption);
        socket.send(JSON.stringify({ event: 'vote', pollId, selectedOption }));
      }
      highlightSelectedOptions(pollId, buttons);
    });
  });

  if (isCreator) {
    const closeBtn = document.querySelector(`.close-poll[data-poll-id="${pollId}"]`);
    closeBtn?.addEventListener('click', () => {
      socket.send(JSON.stringify({ event: 'close-poll', pollId }));
      closeBtn.disabled = true;
      closeBtn.textContent = "Polling Ditutup";
    });
  }

  if (timer > 0) {
    const countdown = setInterval(() => {
      const timeLeftElement = document.getElementById(`timer-${pollId}`);
      if (timeLeftElement) {
        timer--;
        timeLeftElement.textContent = `Sisa waktu: ${formatTime(timer)}`;
        if (timer <= 0) {
          clearInterval(countdown);
          socket.send(JSON.stringify({ event: 'close-poll', pollId }));
          disablePoll(pollId);
        }
      }
    }, 1000);
  }
}

function formatTime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  return `${days} hari ${hours} jam ${minutes} menit ${remainingSeconds} detik`;
}

function highlightSelectedOptions(pollId, buttons) {
  const selected = votedOptions[pollId];
  buttons.forEach(btn => {
    const opt = btn.getAttribute("data-option");
    if (selected.has(opt)) {
      btn.classList.add("voted");
    } else {
      btn.classList.remove("voted");
    }
  });
}

function updatePollVotes(pollId, votes) {
  const buttons = document.querySelectorAll(`button.poll-option[data-poll-id="${pollId}"]`);
  buttons.forEach(btn => {
    const option = btn.getAttribute('data-option');
    if (!option) return;
    const voteCount = votes[option] ?? 0;
    btn.textContent = `${option} (${voteCount} votes)`;
  });
}

function disablePoll(pollId, closedByUser = false) {
  const buttons = document.querySelectorAll(`button.poll-option[data-poll-id="${pollId}"]`);
  buttons.forEach(btn => btn.disabled = true);

  const closeBtn = document.querySelector(`.close-poll[data-poll-id="${pollId}"]`);
  if (closeBtn && !closeBtn.disabled) {
    closeBtn.disabled = true;
    closeBtn.textContent = "Polling Ditutup";
  }

  const timer = document.getElementById(`timer-${pollId}`);
  if (timer) {
    timer.textContent = closedByUser
      ? "Polling ditutup oleh Anda."
      : "Polling ditutup oleh pembuat polling.";
  } else {
    const message = document.querySelector(`.poll-message button[data-poll-id="${pollId}"]`)?.closest(".poll-message");
    if (message) {
      const notice = document.createElement("p");
      notice.className = "poll-timer";
      notice.textContent = closedByUser
        ? "Polling ditutup oleh Anda."
        : "Polling telah ditutup oleh pembuat polling.";
      message.appendChild(notice);
    }
  }
}
document.getElementById("leave-room-button").addEventListener("click", () => {
  socket.send(JSON.stringify({ event: "leave-room" }));
});
