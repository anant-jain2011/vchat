const baseUrl = "https://vchat-4ldl.onrender.com";

function changeDetails() {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const roomNumber = document.getElementById('roomId').value;

    localStorage.setItem("details", JSON.stringify({username, roomNumber}));

    location.href = `${location.origin}/index.html`;

    console.log(url);
};

const select = (n) => {
    n == 1 ? (() => {
        bar.style.left = "12.5%";
        joinCtr.hidden = !joinCtr.hidden;
        createCtr.hidden = !createCtr.hidden;
    })() : (() => {
        bar.style.left = "62.5%";
        joinCtr.hidden = !joinCtr.hidden;
        createCtr.hidden = !createCtr.hidden;
    })();
};

opt.addEventListener("click", (e) => select(1));
opt2.addEventListener("click", (e) => select(2));

const createRoom = () => {
    let newRoomId = Math.floor(100000 + Math.random() * 900000);
    let roomName = document.getElementById("roomName").value;
    let maxMembers = document.getElementById("maxMembers").value;

    let data = {
        roomName,
        roomNumber: newRoomId,
    }

    maxMembers ? data.maxMembers = maxMembers : false;

    (async function () {
        const res = await fetch(baseUrl + "/addRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });


    })();
}