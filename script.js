const msg = document.getElementById("message");
const msgBox = document.getElementById("messages");
const om = document.getElementById("om");

let chats = {
    sent: [],
    received: [],
};

const baseUrl = "https://vchat-4ldl.onrender.com";

const eventSource = new EventSource(baseUrl + '/events');

// Reconnection logic for EventSource
eventSource.onerror = function (event) {
    if (event.readyState === EventSource.CLOSED) {
        // Reconnection logic here
        console.log("Reconnecting to EventSource...");
        eventSource.close();
        eventSource = new EventSource(baseUrl + '/events');
        console.log("error solved");
    }
};

function decodeMessage(message, dateStr) {
    const date = new Date(dateStr);

    if (date.getFullYear() < 2024) {
        return atob(atob(atob(message)));
    } else {
        return decodeURI(decodeURI(atob(message)));
    }
}

async function getChats() {
    const res = await fetch(baseUrl + "/getChats")

    return res.json();
}

const displayMessage = (content, position, id) => {
    var urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    if (content.match(urlRegex)) {
        content = content.replace(content.match(urlRegex), `<a href="${content.match(urlRegex)}" target="_blank">${content.match(urlRegex)}</a>`);
    }

    const newMsg = document.createElement("span");
    newMsg.classList.add(`msg`);
    newMsg.classList.add(`msg-${position}`);
    newMsg.innerHTML = content;

    const arrow = document.createElement("span");

    if (id) {
        newMsg.id = id;
    }

    msgBox.appendChild(newMsg);
};

const deleteSelected = async () => {
    const selected = localStorage.getItem("selected").trim().split(" ");

    let res = await fetch(baseUrl + "/deletechats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            selected,
        }),
    });

    let data = await res.json();

    if (data.success) {
        selected.forEach(id => {
            document.getElementById(id).remove();
        });

        localStorage.setItem("selected", "");

        dlen.parentElement.style.display = "none";
    }
};

window.onload = async () => {
    if (localStorage.getItem("username") == null && location.search != "") {
        const userName = location.search.replace("?", "").split("&")[0].replace("un=", "");
        localStorage.setItem("username", userName);

        const roomNumber = location.search.replace("?", "").split("&")[1].replace("room=", "");
        localStorage.setItem("roomNumber", roomNumber);

        const roomName = decodeURI(location.search.replace("?", "").split("&")[2].replace("roomName=", ""));
        roomname.textContent = roomName;
        localStorage.setItem("roomName", roomName);

        location.search = "";

        // alert("Welcome to India's No.1 Chatting App. Your Room number is " + roomNumber);

        // (async function () {
        //     try {
        //         const res = await fetch(baseUrl + "/username", {
        //             method: "POST",
        //             mode: "no-cors",
        //             headers: {
        //                 "Content-Type": "application/x-www-form-urlencoded",
        //             },
        //             body: JSON.stringify({ userName }),
        //         });
        //     } catch (error) { }
        // })();
    }

    if (localStorage.getItem("username") == null) {
        location.href = "/join/";
    }
    
    if (localStorage.getItem("username") != null) {
        roomname.textContent = localStorage.getItem("roomName");
    }

    msg.focus();

    await getChats().then((messages) => {
        messages.map((message) => {
            if (message.sentFrom != localStorage.getItem("username") && message.roomNumber == localStorage.getItem("roomNumber")) {
                displayMessage(`<b>${message.sentFrom}:</b> ${decodeMessage(message.content, message.createdAt)}`, "left", message._id);
            } 
            
            if (message.sentFrom == localStorage.getItem("username") && message.roomNumber == localStorage.getItem("roomNumber")) {
                displayMessage(decodeMessage(message.content, message.createdAt), "right", message._id);
            }
            msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;
        });
    });

    eventSource.addEventListener("message", (event) => {
        let item = (typeof event.data) == "string" ? JSON.parse(event.data).newMessage : event.data.newMessage;

        if (item.sentFrom != localStorage.getItem("username") && item.roomNumber == localStorage.getItem("roomNumber")) {
            displayMessage(`<b>${message.sentFrom}:</b> ${decodeMessage(message.content, message.createdAt)}`, "left", message._id);
        }

        msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;
    });

    localStorage.setItem("selected", "");

    const toggleSelected = (e) => {
        let msg3 = e.target;
        if (!msg3.classList.value.includes("msg")) {
            msg3 = msg3.parentElement;
        }

        let prevBg = msg3.classList.value.includes("msg-left") ? "#fff" : "#25D366";

        if (localStorage.getItem("selected").includes(msg3.id)) {
            localStorage.setItem("selected", localStorage.getItem("selected").replaceAll(msg3.id + " ", ""));
            msg3.style.backgroundColor = prevBg;

            console.log("already selected, deselecting it", msg3, localStorage.getItem("selected"));
        }

        else {
            localStorage.setItem("selected", localStorage.getItem("selected") + msg3.id + " ");
            msg3.style.backgroundColor = "gray";

            console.log("unselected, selecting it", msg3, localStorage.getItem("selected"));
        }

        dlen.innerHTML = "Delete " + localStorage.getItem("selected").trim().split(" ").length + " Chat(s)";

        if (localStorage.getItem("selected").trim() == "") {
            dlen.parentElement.style.display = "none";
            document.querySelectorAll(".msg").forEach(msg2 => msg2.onclick = () => null);

            localStorage.setItem("selectionMode", false);
            console.log("all cleared");
        }
    };

    document.querySelectorAll(".msg").forEach(msg => {
        msg.addEventListener("mousedown", () => {
            let timeOut = setTimeout(() => {
                msg.style.backgroundColor = "gray";
                dlen.parentElement.style.display = "flex";

                if (!localStorage.getItem("selected").includes(msg.id)) {
                    localStorage.setItem("selected", localStorage.getItem("selected") + msg.id + " ");
                }

                dlen.innerHTML = "Delete " + localStorage.getItem("selected").trim().split(" ").length + " Chat(s)";

                localStorage.setItem("selectionMode", true);
            }, 1000);

            localStorage.setItem("timeOut", timeOut);
        });

        msg.addEventListener("mouseup", () => {
            clearTimeout(localStorage.getItem("timeOut"));

            if (eval(localStorage.getItem("selectionMode"))) {
                document.querySelectorAll(".msg").forEach(msg2 => msg2.onclick = toggleSelected);
            }
        });
    });

    openOptionsMenu();
};

const sendMessage = () => {
    if (msg.value != "") {
        chats.sent.push(msg.value);
        localStorage.setItem("chats", JSON.stringify(chats));

        displayMessage(msg.value, "right");
        msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;

        (async function () {
            const res = await fetch(baseUrl + "/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: localStorage.getItem("username"),
                    roomNumber: localStorage.getItem("roomNumber"),
                    content: msg.value
                }),
            });
        })();

        msg.value = "";
    }
    else {
        alert("Can't send empty message!");
    }
};

const openOptionsMenu = () => {
    let cond = om.style.display == "none";
    om.style.display = cond ? "flex" : "none";
    // document.getElementsByClassName("m-bar")[0].classList.toggle("m-bar2");
};

const clearChats = () => {
    const doClear = confirm("Do you sure want to clear your chats?");
    if (doClear) {
        chats.sent = [];
        localStorage.setItem("chats", JSON.stringify(chats));
        msgBox.innerHTML = "";
    }
};

function leaveRoom () {
    localStorage.removeItem("username");
    localStorage.removeItem("roomNumber");
    localStorage.removeItem("roomName");
    location.href = "/join/";
}