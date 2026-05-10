const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value;

  const res = await fetch(`http://localhost:5000/api/books?q=${query}`);
  const books = await res.json();

  // if the API times out...
  if (!res.ok) {
    document.getElementById("results").textContent = "Search failed, please try again later!";
    return;
  }

  displayBooks(books);
});

function createReview(ID){
  alert(ID);
  window.location.href = `bookpage.html?id=${ID}`;
}; 

// Retrieve the stored access token (matches how auth.js stores it)
function getToken() {
  return localStorage.getItem("token");
}

async function addToWishlist(book, btn) {
  const token = getToken();
  if (!token) {
    alert("You need to be logged in to save books to your wishlist.");
    return;
  }

  // Disable button immediately to prevent double-clicks
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    const res = await fetch("http://localhost:5000/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        book_key: book.key,
        title: book.title,
        author: book.author || null,
        year: book.year || null,
        cover_id: book.coverId || null
      })
    });

    if (res.status === 409) {
      btn.textContent = "✓ Saved";
      btn.classList.add("wishlisted");
      return;
    }

    if (!res.ok) {
      btn.disabled = false;
      btn.textContent = "♡ Wishlist";
      alert("Failed to add to wishlist, please try again.");
      return;
    }

    // Success — add the cover to the wishlist scroller immediately
    btn.textContent = "✓ Saved";
    btn.classList.add("wishlisted");
    addBookToWishlistScroller(book);

  } catch (err) {
    console.error("Wishlist error:", err);
    btn.disabled = false;
    btn.textContent = "♡ Wishlist";
  }
}

// Adds a single book cover into the wishlist scroller
function addBookToWishlistScroller(book) {
  const scroller = document.getElementById("wishlistScroller");
  const emptyMsg = document.getElementById("wishlistEmpty");

  // hide the "no books" message once we add one
  if (emptyMsg) emptyMsg.hidden = true;

  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null;

  if (!coverUrl) return;

  // avoid duplicates in the scroller
  const existing = scroller.querySelector(`img[data-key="${book.key}"]`);
  if (existing) return;

  const img = document.createElement("img");
  img.src = coverUrl;
  img.alt = book.title;
  img.title = book.title;
  img.dataset.key = book.key;
  img.addEventListener("click", () => {
    window.location.href = `bookpage.html?id=${book.key}`;
  });

  scroller.appendChild(img);
}

// Loads the full wishlist scroller on page load
async function loadWishlistScroller() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/wishlist", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return;

    const books = await res.json();
    const scroller = document.getElementById("wishlistScroller");
    const emptyMsg = document.getElementById("wishlistEmpty");

    if (books.length === 0) return;

    if (emptyMsg) emptyMsg.hidden = true;

    books.forEach(book => {
      const coverUrl = book.cover_id
        ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
        : null;

      if (!coverUrl) return;

      const img = document.createElement("img");
      img.src = coverUrl;
      img.alt = book.title;
      img.title = book.title;
      img.dataset.key = book.book_key;
      img.addEventListener("click", () => {
        window.location.href = `bookpage.html?id=${book.book_key}`;
      });

      scroller.appendChild(img);
    });

  } catch (err) {
    console.error("Failed to load wishlist scroller:", err);
  }
}

function displayBooks(books) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  books.forEach(book => {
    console.log(book.title);
    const div = document.createElement("div");

    const coverUrl = book.coverId
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
      : "";

    div.innerHTML = `
      <h3>${book.title}</h3>
      <p><a href="authors.html?author=${encodeURIComponent(book.author || "Unknown author")}"
        onclick="event.stopPropagation()">${book.author || "Unknown author"}</a></p>
      <p>${book.year || "No year available"}</p>
      ${coverUrl ? `<img src="${coverUrl}" />` : ""}
      <button class="wishlist-btn" onclick="event.stopPropagation()">♡ Wishlist</button>
    `;

    const wishlistBtn = div.querySelector(".wishlist-btn");
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToWishlist(book, wishlistBtn);
    });

    div.addEventListener("click", async () => {
      createReview(book.key);
    });

    container.appendChild(div);
  });
}

const profileBtn = document.getElementById("profileBtn");
profileBtn.addEventListener("click", async () => {
  console.log("presed");
  window.location.href = "profile.html";
});

const wishlistBtn = document.getElementById("wishlistBtn"); 
wishlistBtn.addEventListener("click", () => { 
  window.location.href = "wishlistMain.html";
});

function addBook(div, coverUrl, book) {
  const scroller = document.getElementById(div);

  const newImage = document.createElement("img");
  newImage.src = coverUrl;
  newImage.alt = "New Book";
  newImage.addEventListener("click", async () => {
    createReview(book);
  });

  scroller.appendChild(newImage);
};

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let userData;

  try {
    const res = await fetch("http://localhost:5000/auth/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    userData = data;
  } catch (err) {
    console.error(err);
  }

  console.log(userData);

  // Load wishlist scroller
  await loadWishlistScroller();

  // Load recently viewed
  const response = await fetch(
    `http://localhost:5000/api/books/userBooks?q=${userData.userID}`
  );

  const apiIDs = await response.json();
  console.log("bookIDs", apiIDs);

  for (let i = 0; i < apiIDs.length; i++) {
    const apiID = apiIDs[i].apiID;
    const res = await fetch(`http://127.0.0.1:5000/api/books/book?q=${apiID}`);
    const data = await res.json();

    const coverUrl = data.coverId
      ? `https://covers.openlibrary.org/b/id/${data.coverId}-M.jpg`
      : "";

    addBook("recentlyViewed", coverUrl, apiID);
  };
});