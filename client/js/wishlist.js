function getToken() {
  return localStorage.getItem("token");
}

async function loadWishlist() {
  const token = getToken();
  const errorState = document.getElementById("error-state");
  const emptyState = document.getElementById("empty-state");
  const container = document.getElementById("wishlist-results");
  const countEl = document.getElementById("wishlist-count");

  if (!token) {
    errorState.hidden = false;
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/wishlist", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      errorState.hidden = false;
      return;
    }

    if (!res.ok) {
      errorState.hidden = false;
      return;
    }

    const books = await res.json();

    countEl.textContent = `${books.length} book${books.length !== 1 ? "s" : ""}`;

    if (books.length === 0) {
      emptyState.hidden = false;
      return;
    }

    renderBooks(books, container);

  } catch (err) {
    console.error("Failed to load wishlist:", err);
    errorState.hidden = false;
  }
}

function renderBooks(books, container) {
  container.innerHTML = "";

  books.forEach((book, i) => {
    const coverUrl = book.cover_id
      ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
      : null;

    const card = document.createElement("div");
    card.className = "wish-card";
    card.style.animationDelay = `${i * 60}ms`;

    card.innerHTML = `
      <div class="wish-cover">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="Cover of ${book.title}" />`
          : `<div class="wish-cover-placeholder">📖</div>`
        }
      </div>
      <div class="wish-info">
        <h3 class="wish-title">${book.title}</h3>
        <p class="wish-author">
          <a href="authors.html?author=${encodeURIComponent(book.author || "Unknown author")}">
            ${book.author || "Unknown author"}
          </a>
        </p>
        ${book.year ? `<p class="wish-year">${book.year}</p>` : ""}
      </div>
      <div class="wish-actions">
        <button class="btn-view">View</button>
        <button class="btn-remove">✕ Remove</button>
      </div>
    `;

    card.querySelector(".btn-view").addEventListener("click", () => {
      window.location.href = `bookpage.html?id=${book.book_key}`;
    });

    card.querySelector(".btn-remove").addEventListener("click", async (e) => {
      e.stopPropagation();
      await removeFromWishlist(book.book_key, card);
    });

    container.appendChild(card);
  });
}

async function removeFromWishlist(bookKey, card) {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:5000/api/wishlist?book_key=${encodeURIComponent(bookKey)}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      card.classList.add("removing");
      card.addEventListener("animationend", () => {
        card.remove();
        const remaining = document.querySelectorAll(".wish-card").length;
        document.getElementById("wishlist-count").textContent =
          `${remaining} book${remaining !== 1 ? "s" : ""}`;
        if (remaining === 0) {
          document.getElementById("empty-state").hidden = false;
        }
      }, { once: true });
    }
  } catch (err) {
    console.error("Failed to remove book:", err);
  }
}

// Kick off on page load
loadWishlist();
