const TIERS = ["S", "A", "B", "C", "D", "pool"];
const LABELS = ["S", "A", "B", "C", "D", "未配置"];

let peer = null;
let role = null;
let myIndex = -1;
let myName = "";
let hostPeerId = "";
let conns = [];
let state = {
  items: [],
  people: [],
  boards: {},
  revealed: false
};

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

function blank() {
  return { S: [], A: [], B: [], C: [], D: [], pool: [] };
}

function status(text) {
  $("status").textContent = text;
}

function snap() {
  return JSON.parse(JSON.stringify(state));
}

function send(m) {
  conns.forEach(c => c.open && c.send(m));
}

function addPerson(n) {
  if (state.people.length >= 6) return -1;
  let i = state.people.length;
  state.people.push(n);
  state.boards[i] = blank();
  state.items.forEach(x => state.boards[i].pool.push(x));
  return i;
}

function broadcast() {
  send({ type: "state", state: snap() });
  renderHost();
  renderDisplay();
  renderMy();
}

function renderHost() {
  $("hostId").textContent = hostPeerId;
  $("itemsList").innerHTML = state.items.map(x => `<span class="tag">${esc(x)}</span>`).join(" ");
}

function renderMy() {
  if (myIndex < 0 || !state.boards[myIndex]) return;
  let r = $("myBoard");
  r.innerHTML = "";

  TIERS.forEach((t, i) => {
    let row = document.createElement("div");
    row.className = "tier";
    row.innerHTML = `<div class="label">${LABELS[i]}</div><div class="cards"></div>`;
    let cardsContainer = row.querySelector(".cards");

    (state.boards[myIndex][t] || []).forEach((x, k) => {
      let c = document.createElement("div");
      c.className = "card";
      c.draggable = true;
      c.textContent = x;

      c.ondragstart = e => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ fromTier: t, cardIndex: k }));
      };

      c.onclick = () => {
        state.boards[myIndex][t].splice(k, 1);
        sync();
        renderMy();
      };

      cardsContainer.appendChild(c);
    });

    cardsContainer.ondragover = e => e.preventDefault();
    cardsContainer.ondrop = e => {
      e.preventDefault();
      let rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;
      let data = JSON.parse(rawData);
      move(data, t);
    };

    r.appendChild(row);
  });
}

function move(data, toTier) {
  if (data.fromTier === toTier) return;
  let b = state.boards[myIndex];
  let val = b[data.fromTier].splice(data.cardIndex, 1)[0];
  if (val !== undefined) {
    b[toTier].push(val);
  }
  sync();
  renderMy();
}

function sync() {
  let m = { type: "board", index: myIndex, name: myName, board: state.boards[myIndex] };
  if (role === "host") {
    state.people[myIndex] = myName;
    send(m);
    renderDisplay();
  } else if (window.meConn?.open) {
    window.meConn.send(m);
  }
}

function renderDisplay() {
  let r = $("allBoards");
  let statusBadge = $("revealStatus");
  if (!r) return;

  if (statusBadge) {
    statusBadge.textContent = state.revealed ? "🎉 全員公開中！" : "🔒 各自編集中（非公開）";
  }

  r.innerHTML = "";

  if (!state.revealed) {
    r.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-weight: 800;">主催者が「全員公開」を押すまで待っててな！🎀</div>`;
    return;
  }

  state.people.forEach((n, i) => {
    let p = document.createElement("div");
    p.className = "person";
    p.innerHTML = `<h3>${esc(n)}</h3>`;

    TIERS.slice(0, 5).forEach((t, j) => {
      let cardsHtml = (state.boards[i]?.[t] || [])
        .map(x => `<span class="card">${esc(x)}</span>`)
        .join("");
      p.innerHTML += `
        <div class="tier">
          <div class="label">${LABELS[j]}</div>
          <div class="cards">${cardsHtml}</div>
        </div>
      `;
    });

    r.appendChild(p);
  });
}

function show(id) { $(id).classList.remove("hidden"); }
function hide(id) { $(id).classList.add("hidden"); }

$("hostBtn").onclick = () => {
  role = "host";
  peer = new Peer();

  peer.on("open", id => {
    hostPeerId = id;
    myName = "主催者";
    myIndex = addPerson(myName);

    hide("start");
    show("hostPanel");
    show("playerPanel");
    show("displayPanel");
    $("playerName").textContent = "👑 " + myName;
    status("主催者として接続中");

    renderHost();
    renderMy();
    renderDisplay();
  });

  peer.on("connection", c => {
    conns.push(c);
    c.on("open", () => c.send({ type: "init", state: snap() }));
    c.on("data", m => {
      if (m.type === "join") {
        let i = addPerson(m.name || "参加者");
        if (i < 0) return c.send({ type: "full" });
        c.send({ type: "assigned", index: i, state: snap() });
        broadcast();
      } else if (m.type === "board") {
        state.people[m.index] = m.name;
        state.boards[m.index] = m.board;
        broadcast();
      }
    });
  });
};

$("joinBtn").onclick = () => {
  let hid = $("hostIdInput").value.trim();
  let n = $("nameInput").value.trim() || "参加者";
  if (!hid) return alert("ルームIDを入力してな〜！");

  role = "player";
  myName = n;
  peer = new Peer();

  peer.on("open", () => {
    window.meConn = peer.connect(hid, { reliable: true });
    window.meConn.on("open", () => window.meConn.send({ type: "join", name: n }));
    window.meConn.on("data", m => {
      if (m.type === "assigned") {
        myIndex = m.index;
        state = m.state;
        $("playerName").textContent = "🎀 " + n;
        hide("start");
        show("playerPanel");
        show("displayPanel");
        renderMy();
        renderDisplay();
        status("参加中！");
      }
      if (m.type === "state") {
        state = m.state;
        renderMy();
        renderDisplay();
      }
      if (m.type === "full") {
        alert("ごめん！満員やわ💦");
      }
    });
  });
};

$("addItemBtn").onclick = () => {
  let x = $("itemInput").value.trim();
  if (!x) return;
  state.items.push(x);
  state.people.forEach((_, i) => {
    if (!state.boards[i]) state.boards[i] = blank();
    state.boards[i].pool.push(x);
  });
  $("itemInput").value = "";
  broadcast();
};

$("localAddBtn").onclick = () => {
  let x = $("localItemInput").value.trim();
  if (!x) return;
  state.boards[myIndex].pool.push(x);
  $("localItemInput").value = "";
  sync();
  renderMy();
};

$("revealBtn").onclick = () => {
  state.revealed = true;
  broadcast();
};

$("hideBtn").onclick = () => {
  state.revealed = false;
  broadcast();
};

$("resetBtn").onclick = () => {
  if (confirm("ほんまに全員リセットしてええの？")) {
    state.boards = {};
    state.people.forEach((_, i) => {
      state.boards[i] = blank();
      state.items.forEach(x => state.boards[i].pool.push(x));
    });
    broadcast();
  }
};

$("copyBtn").onclick = () => {
  navigator.clipboard?.writeText(hostPeerId);
  alert("ルームIDコピーしたよ〜！📋✨");
};

$("displayConnectBtn").onclick = () => {
  let hid = $("displayHostInput").value.trim();
  if (!hid) return;
  peer = new Peer();
  peer.on("open", () => {
    let c = peer.connect(hid, { reliable: true });
    c.on("data", m => {
      if (m.type === "init" || m.type === "state") {
        state = m.state;
        renderDisplay();
      }
    });
  });
  hide("start");
  show("displayPanel");
  status("配信用画面");
};
