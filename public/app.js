async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });

  const data = await res.json();
  if (data.ok) {
    login.style.display = "none";
    app.style.display = "block";
    loadPosts();
  }
}

function logout() {
  fetch("/logout").then(() => location.reload());
}

async function post() {
  await fetch("/post", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ content: postText.value })
  });
  loadPosts();
}

async function loadPosts() {
  const res = await fetch("/posts");
  const posts = await res.json();

  timeline.innerHTML = "";
  posts.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <b>${p.user}</b>: ${p.content}
      <button onclick="like(${p.id})">いいね</button>
    `;
    timeline.appendChild(div);
  });
}

function like(id) {
  fetch("/like", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ postId: id })
  });
}

function createGroup() {
  fetch("/group", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name: groupName.value })
  });
}