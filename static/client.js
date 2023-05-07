const username = document.getElementById("username");
const password = document.getElementById("password");
const button = document.getElementById("login");
const sign = document.getElementById("sign");
const message = document.getElementById("message");
const box = document.getElementById("box");

const post_message = (msg) => {
  const username = msg.username;
  const message = msg.message;
  const br = document.createElement("br");
  const div = document.createElement("div");
  div.innerText = username + ": " + message;
  box.appendChild(div);
  box.append(br);
};

const post_request = (server, data, error_text) => {
  fetch(server, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/html",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        console.log(response.clone().json());
        return response.json();
      } else {
        throw new Error("Error: " + response.status);
      }
    })
    .then((data) => {
      if (data.message === "Authorized") {
        window.location.href = "http://localhost:5000/home";
      } else {
        add_text(data.message);
      }
      console.log("Response: " + data.message);
    })
    .catch((error) => {
      console.log("Error: " + error);
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
      socket.emit("putangina", {
        username: document.cookie,
        message: message.value,
      });
      message.value = "";
    }
  });
}
