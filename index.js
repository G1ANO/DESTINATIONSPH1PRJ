document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  displayDestinations();
  addNewDestinationListener();
  document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode);
});

const API = "http://localhost:3000";

function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
      document.getElementById(btn.dataset.target).classList.remove("hidden");
      if (btn.dataset.target === "wishlist") loadList("wishlist", document.getElementById("wishlistList"));
      if (btn.dataset.target === "likes") loadList("likes", document.getElementById("likesList"));
    });
  });

  document.getElementById("search").addEventListener("input", displayDestinations);
}

function displayDestinations() {
  fetch(`${API}/destinations`)
    .then(r => r.json())
    .then(posts => {
      const query = document.getElementById("search").value.toLowerCase();
      const list = document.getElementById("destinationsList");
      list.innerHTML = "";
      posts
        .filter(post => post.title.toLowerCase().includes(query))
        .forEach(post => appendPost(post));
    })
    .catch(console.error);
}

function appendPost(post) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>${post.title}</h3>
    <p>${post.description}</p>
    ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ""}
    <div style="margin-top: 0.5rem;">
      <button class="like-btn">Like</button>
      <button class="wishlist-btn">Wishlist</button>
      ${post.userCreated ? `<button class="delete-btn">Delete</button>` : ""}
    </div>
  `;

  card.querySelector(".like-btn").addEventListener("click", () => addToList("likes", post.title));
  card.querySelector(".wishlist-btn").addEventListener("click", () => addToList("wishlist", post.title));

  if (post.userCreated) {
    card.querySelector(".delete-btn").addEventListener("click", () => deletePost(post.id));
  }

  document.getElementById("destinationsList").appendChild(card);
}

function addNewDestinationListener() {
  document.getElementById("addForm").addEventListener("submit", e => {
    e.preventDefault();
    const post = {
      title: e.target.title.value.trim(),
      description: e.target.description.value.trim(),
      image: e.target.image.value.trim(),
      userCreated: true
    };
    if (!post.title || !post.description) return;

    fetch(`${API}/destinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post)
    })
      .then(r => r.json())
      .then(newPost => {
        appendPost(newPost);
        e.target.reset();
      })
      .catch(console.error);
  });
}

function addToList(type, title) {
  fetch(`${API}/${type}`)
    .then(r => r.json())
    .then(list => {
      if (!list.find(item => item.title === title)) {
        return fetch(`${API}/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title })
        });
      }
    })
    .then(() => loadList(type, document.getElementById(type + "List")))
    .catch(console.error);
}

function loadList(type, container) {
  fetch(`${API}/${type}`)
    .then(r => r.json())
    .then(items => {
      container.innerHTML = "";
      items.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `
          <span>${item.title}</span>
          <button class="delete-btn">Delete</button>
        `;
        li.querySelector(".delete-btn").addEventListener("click", () => {
          fetch(`${API}/${type}/${item.id}`, { method: "DELETE" })
            .then(() => loadList(type, container))
            .catch(console.error);
        });
        container.appendChild(li);
      });
    })
    .catch(console.error);
}

function deletePost(id) {
  fetch(`${API}/destinations/${id}`, { method: "DELETE" })
    .then(() => displayDestinations())
    .catch(console.error);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  const btn = document.getElementById("darkModeToggle");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  btn.textContent = mode === "dark" ? "Light Mode" : "Dark Mode";
  localStorage.setItem("theme", mode);
}

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light";
  document.body.classList.add(saved + "-mode");
  document.getElementById("darkModeToggle").textContent = saved === "dark" ? "Light Mode" : "Dark Mode";
});
