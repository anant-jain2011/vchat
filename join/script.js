const baseUrl = "https://vchat-4ldl.onrender.com";

function changeDetails() {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const roomNumber = document.getElementById('roomId').value;

    (async function () {
        const res = await fetch(baseUrl + "/room?rn=" + roomNumber);

        let resp = await res.json();

        localStorage.setItem("details", JSON.stringify({ username, roomNumber, roomName: resp[0].roomName }));

        location.href = `${location.origin}/index.html`;
    })();
};

const select = (n) => {
    n == 1 ? (() => {
        bar.style.left = "12.5%";
        joinCtr.hidden = false;
        createCtr.hidden = true;
    })() : (() => {
        bar.style.left = "62.5%";
        joinCtr.hidden = true;
        createCtr.hidden = false;
    })();
};

opt.addEventListener("click", (e) => select(1));
opt2.addEventListener("click", (e) => select(2));

const createRoom = () => {
    event.preventDefault();

    let username = document.getElementById('username').value;
    let roomName = document.getElementById('roomName').value;
    let newRoomId = Math.floor(100000 + Math.random() * 900000);
    let maxMembers = document.getElementById("maxMembers").value;

    let data = {
        roomName,
        roomNumber: newRoomId,
    }

    maxMembers ? data.maxMembers = maxMembers : false;

    (async function () {
        try {
        const res = await fetch(baseUrl + "/addRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        let resp = res.json();

        location.href = `${location.origin}/index.html?newRoom`;
        }
        catch(err) {
            alert(err);
        }
    })();

    localStorage.setItem("details", JSON.stringify({ username, ...data }));
}
