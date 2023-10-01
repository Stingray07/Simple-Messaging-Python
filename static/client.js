let username = document.getElementById("username");
const password = document.getElementById("password");
const button = document.getElementById("login");
const sign = document.getElementById("sign");
const message = document.getElementById("message");
const box = document.getElementById("box");
const username_for_room = document.getElementById("username_for_room");
const room = document.getElementById("room");
const room_button = document.getElementById("join_room_button");

const post_message = (msg) => {
  const username = msg.username;
  const message = msg.message;
  const br = document.createElement("br");
  const div = document.createElement("div");
  div.innerText = username + ": " + message;
  box.appendChild(div);
  box.append(br);
};

const post_request = (server, data) => {
  fetch(server, {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Accept") {
        window.location.href = "http://localhost:5000/home";
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

if (window.location.href === "http://localhost:5000/") {
  button.addEventListener("click", () => {
    const x = username.value;
    const y = password.value;

    const data = {
      username: x,
      password: y,
    };
    const server = "http://localhost:5000/";
    let date = new Date("2024-01-01T00:00:00Z");
    let expires = date.toUTCString();
    document.cookie = x + "; expires=" + expires;
    post_request(server, data, "Please Try Again");
  });

  sign.addEventListener("click", () => {
    window.location.href = "http://localhost:5000/create_account";
  });

  room_button.addEventListener("click", () => {
    const socket = io.connect("http://localhost:5000/");
    socket.on("join", () => {
      socket.emit("HAHAH");
    });
  });
}

if (window.location.href === "http://localhost:5000/create_account") {
  button.addEventListener("click", () => {
    const x = username.value;
    const y = password.value;
    const data = {
      username: x,
      password: y,
    };
    const server = "http://localhost:5000/create_account";
    post_request(server, data, "Username already exists");

    x.innerText = "";
    y.innerText = "";
  });
}

if (window.location.href === "http://localhost:5000/home") {
  fetch("http://localhost:5000/home", {
    method: "POST",
    body: JSON.stringify({
      message: "get_username",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      username = data.username;
      console.log(username);
    })
    .catch((error) => {
      console.log(error);
    });
  var socket = io.connect("http://localhost:5000/home");
  socket.on("response", (msg) => {
    if (msg.sender !== socket.id) {
      console.log("RECEIVED MESSAGE = " + JSON.stringify(msg));
      post_message(msg);
    }
  });

  message.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      if (message.value === "") {
        return;
      }
      socket.emit("message_socket", {
        username: username,
        message: message.value,
      });
      message.value = "";
    }
  });
}
