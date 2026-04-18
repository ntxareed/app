const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: "school-sns",
  resave: false,
  saveUninitialized: true
}));

const db = new sqlite3.Database("db.sqlite");

// テーブル作成
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    user TEXT,
    content TEXT,
    groupId INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY,
    postId INTEGER,
    user TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY,
    name TEXT
  )`);
});

// ログイン
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, row) => {
    if (row) {
      req.session.user = username;
      res.send({ ok: true });
    } else {
      res.send({ ok: false });
    }
  });
});

// ログアウト
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send({ ok: true });
});

// 投稿
app.post("/post", (req, res) => {
  if (!req.session.user) return res.sendStatus(403);
  db.run("INSERT INTO posts(user, content, groupId) VALUES(?,?,?)",
    [req.session.user, req.body.content, req.body.groupId || 0]);
  res.send({ ok: true });
});

// 投稿取得
app.get("/posts", (req, res) => {
  db.all("SELECT * FROM posts", (err, rows) => {
    res.send(rows);
  });
});

// いいね
app.post("/like", (req, res) => {
  db.run("INSERT INTO likes(postId, user) VALUES(?,?)",
    [req.body.postId, req.session.user]);
  res.send({ ok: true });
});

// グループ作成
app.post("/group", (req, res) => {
  db.run("INSERT INTO groups(name) VALUES(?)", [req.body.name]);
  res.send({ ok: true });
});

// グループ一覧
app.get("/groups", (req, res) => {
  db.all("SELECT * FROM groups", (err, rows) => {
    res.send(rows);
  });
});

app.listen(3000, () => console.log("Server running"));