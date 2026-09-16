(()=>{const files=[{name:"index.html",content:`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>みんなのTier表 ♡ Online</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800;900&display=swap" rel="stylesheet">
</head>
<body>

<header>
  <div class="header-title">
    <h1>🎀 みんなのTier表 🎀</h1>
    <small>みんなでワイワイ作って一斉公開しちゃお✨</small>
  </div>
  <div class="status-badge">
    状態: <b id="status">未接続</b>
  </div>
</header>

<section id="start" class="panel">
  <h2>👑 ルームを作る</h2>
  <button id="hostBtn" class="btn btn-primary">主催者として開始</button>
  
  <div class="divider"><span>OR</span></div>
  
  <h2>💌 参加する</h2>
  <div class="input-group">
    <input id="hostIdInput" placeholder="主催者のルームIDを入力">
    <input id="nameInput" placeholder="あなたの名前（ニックネーム）">
    <button id="joinBtn" class="btn btn-secondary">参加する！</button>
  </div>
</section>

<section id="hostPanel" class="panel hidden">
  <div class="host-info-bar">
    <span class="room-id-wrap">
      ルームID: <code id="hostId"></code>
      <button id="copyBtn" class="btn-sm">コピー</button>
    </span>
  </div>

  <div class="row">
    <input id="itemInput" placeholder="候補を追加（例: ショートケーキ、タピオカ）">
    <button id="addItemBtn" class="btn btn-primary">＋ 候補追加</button>
  </div>
  <div id="itemsList" class="items-list"></div>

  <div class="button-group">
    <button id="revealBtn" class="btn btn-accent">✨ 全員公開！</button>
    <button id="hideBtn" class="btn btn-subtle">🙈 再び非公開</button>
    <button id="resetBtn" class="btn btn-danger">🗑 全員リセット</button>
  </div>
</section>

<section id="playerPanel" class="panel hidden">
  <div class="player-header">
    <h2 id="playerName">マイTier表</h2>
    <div class="row">
      <input id="localItemInput" placeholder="自分だけの候補を追加">
      <button id="localAddBtn" class="btn btn-secondary">自分用追加</button>
    </div>
  </div>
  <div id="myBoard"></div>
  <p class="hint-text">💡 カードをドラッグ＆ドロップで配置移動 / クリックで削除できるよ！</p>
</section>

<section id="displayPanel" class="panel wide-panel hidden">
  <div class="panel-header">
    <h2>🎉 みんなのTier結果一覧</h2>
    <span class="badge" id="revealStatus">非公開中</span>
  </div>
  <div id="allBoards" class="grid-three"></div>
</section>

<section id="spectatorConnectPanel" class="panel hidden">
  <h2>📺 配信用画面として接続</h2>
  <div class="row">
    <input id="displayHostInput" placeholder="主催者のルームID">
    <button id="displayConnectBtn" class="btn btn-primary">表示に接続</button>
  </div>
</section>

<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script src="app.js"></script>
</body>
</html>`},{name:"style.css",content:`:root {
  --bg-pink: #fff0f5;
  --panel-bg: #ffffff;
  --primary-pink: #ff69b4;
  --primary-dark: #e05297;
  --soft-pink: #ffe4e1;
  --light-pink: #fff5f7;
  --border-pink: #ffccd5;
  --text-main: #5c3a4d;
  --text-muted: #9c7a8d;
  --shadow: 0 8px 24px rgba(255, 105, 180, 0.15);
  
  --tier-s: #ff5e7e;
  --tier-a: #ff92a4;
  --tier-b: #ffb6b9;
  --tier-c: #bbded6;
  --tier-d: #8ac6d1;
  --tier-pool: #e2d4e6;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--bg-pink);
  background-image: radial-gradient(#ffd1dc 1.5px, transparent 1.5px);
  background-size: 20px 20px;
  color: var(--text-main);
  font-family: "M PLUS Rounded 1c", -apple-system, BlinkMacSystemFont, "Noto Sans JP", sans-serif;
  padding-bottom: 40px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #ffffffdd;
  backdrop-filter: blur(8px);
  border-bottom: 3px solid var(--border-pink);
  position: sticky;
  top: 0;
  z-index: 100;
}

h1 {
  font-size: 22px;
  margin: 0;
  color: var(--primary-pink);
  font-weight: 900;
  text-shadow: 1px 1px 0 #fff;
}

small {
  color: var(--text-muted);
  font-weight: 800;
}

.status-badge {
  background: var(--soft-pink);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 800;
  color: var(--primary-dark);
}

.panel {
  margin: 20px auto;
  max-width: 1000px;
  padding: 22px;
  background: var(--panel-bg);
  border: 2px solid var(--border-pink);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.wide-panel { max-width: 1400px; }
.hidden { display: none !important; }

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: var(--border-pink);
  font-weight: 900;
}
.divider::before, .divider::after {
  content: "";
  flex: 1;
  height: 2px;
  background: var(--border-pink);
}
.divider span { padding: 0 10px; }

.row, .input-group {
  display: flex;
  gap: 10px;
  margin: 12px 0;
  flex-wrap: wrap;
}

input {
  background: var(--light-pink);
  color: var(--text-main);
  border: 2px solid var(--border-pink);
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 240px;
  font-weight: 800;
  outline: none;
  transition: 0.2s;
}

input:focus {
  border-color: var(--primary-pink);
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
}

button, .btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease;
}

button:active {
  transform: translateY(2px);
  box-shadow: none;
}

.btn-primary { background: var(--primary-pink); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-secondary { background: #ff85a2; color: #fff; }
.btn-accent { background: #ff477e; color: #fff; font-size: 16px; }
.btn-subtle { background: #f0e6ed; color: var(--text-muted); }
.btn-danger { background: #ffb4a2; color: #722f2f; }
.btn-sm { padding: 5px 10px; border-radius: 8px; background: var(--primary-pink); color: #fff; }

code {
  background: var(--light-pink);
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--primary-dark);
  font-weight: 900;
  border: 1px dashed var(--primary-pink);
}

.tag {
  background: var(--soft-pink);
  color: var(--primary-dark);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 800;
  margin: 4px;
  border: 1px solid var(--border-pink);
}

.tier {
  display: flex;
  min-height: 56px;
  border-bottom: 2px solid var(--border-pink);
  background: #fff;
}
.tier:first-child { border-top-left-radius: 12px; border-top-right-radius: 12px; }
.tier:last-child { border-bottom: none; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }

.label {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.tier:nth-child(1) .label { background: var(--tier-s); }
.tier:nth-child(2) .label { background: var(--tier-a); }
.tier:nth-child(3) .label { background: var(--tier-b); }
.tier:nth-child(4) .label { background: var(--tier-c); color: #446; }
.tier:nth-child(5) .label { background: var(--tier-d); color: #335; }
.tier:nth-child(6) .label { background: var(--tier-pool); color: #555; font-size: 13px; }

.cards {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: #fffcfd;
}

.card {
  background: #ffffff;
  color: var(--text-main);
  border: 2px solid var(--border-pink);
  padding: 8px 14px;
  border-radius: 10px;
  cursor: grab;
  user-select: none;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(255, 105, 180, 0.12);
  transition: transform 0.1s, box-shadow 0.1s;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-pink);
}

.hint-text {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
  margin-top: 8px;
}

.grid-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 15px;
}

.person {
  background: #fff;
  border: 2px solid var(--border-pink);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.08);
}

.person h3 {
  margin: 0;
  padding: 10px 14px;
  background: var(--soft-pink);
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 900;
  border-bottom: 2px solid var(--border-pink);
}

.person .tier { min-height: 48px; }
.person .label { width: 44px; font-size: 15px; }

.badge {
  background: var(--soft-pink);
  color: var(--primary-pink);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1024px) {
  .grid-three { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 650px) {
  .grid-three { grid-template-columns: 1fr; }
  .panel { margin: 10px; padding: 14px; }
  input { min-width: 0; flex: 1; }
}`},{name:"app.js",content:`const TIERS = ["S", "A", "B", "C", "D", "pool"];
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
  $("itemsList").innerHTML = state.items.map(x => \`<span class="tag">\${esc(x)}</span>\`).join(" ");
}

function renderMy() {
  if (myIndex < 0 || !state.boards[myIndex]) return;
  let r = $("myBoard");
  r.innerHTML = "";

  TIERS.forEach((t, i) => {
    let row = document.createElement("div");
    row.className = "tier";
    row.innerHTML = \`<div class="label">\${LABELS[i]}</div><div class="cards"></div>\`;
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
    r.innerHTML = \`<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-weight: 800;">主催者が「全員公開」を押すまで待っててな！🎀</div>\`;
    return;
  }

  state.people.forEach((n, i) => {
    let p = document.createElement("div");
    p.className = "person";
    p.innerHTML = \`<h3>\${esc(n)}</h3>\`;

    TIERS.slice(0, 5).forEach((t, j) => {
      let cardsHtml = (state.boards[i]?.[t] || [])
        .map(x => \`<span class="card">\${esc(x)}</span>\`)
        .join("");
      p.innerHTML += \`
        <div class="tier">
          <div class="label">\${LABELS[j]}</div>
          <div class="cards">\${cardsHtml}</div>
        </div>
      \`;
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
};`}];files.forEach(f=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([f.content],{type:"text/plain;charset=utf-8"}));a.download=f.name;a.click();URL.revokeObjectURL(a.href);});})();