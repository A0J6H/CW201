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
      // Already in wishlist
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

    // Success
    btn.textContent = "✓ Saved";
    btn.classList.add("wishlisted");

  } catch (err) {
    console.error("Wishlist error:", err);
    btn.disabled = false;
    btn.textContent = "♡ Wishlist";
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

    // FIX: wishlist button must be in the innerHTML so querySelector can find it
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p><a href="authors.html?author=${encodeURIComponent(book.author || "Unknown author")}"
        onclick="event.stopPropagation()">${book.author || "Unknown author"}</a></p>
      <p>${book.year || "No year available"}</p>
      ${coverUrl ? `<img src="${coverUrl}" />` : ""}
      <button class="wishlist-btn" onclick="event.stopPropagation()">♡ Wishlist</button>
    `;

    // Wire up wishlist button
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
  console.log("presed")
  window.location.href = "profile.html";
});

const wishlistBtn = document.getElementById("wishlistBtn"); 
wishlistBtn.addEventListener("click", async () => { 
  window.location.href = "wishlist.html";
});

function addBook(div, coverUrl, book) {
  const scroller = document.getElementById(div);

  // Create a new image
  const newImage = document.createElement("img");

  // Set the image source
  newImage.src = coverUrl;

  // Optional alt text
  newImage.alt = "New Book";
  newImage.addEventListener("click", async () => {
    createReview(book);
  });

  // Add image into the scroller
  scroller.appendChild(newImage);
};

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let userData;
  try {
        // send a request for profile, includes the JWT in the header
        // route is: profile.js -> authmiddleware.js -> auth.js if successful
        // because we're using refresh tokens, we need a fetchWithAuth instead of fetch
        const res = await fetch("http://localhost:5000/auth/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        const data = await res.json();
        userData = data;
    } catch (err) {
        // for general network errors, although this should be rarely triggered
        console.error(err);
    }

  console.log(userData);

  const response = await fetch(
    `http://localhost:5000/api/books/userBooks?q=${userData.userID}`
    );

    const apiIDs = await response.json();
    console.log("bookIDs", apiIDs);

    for(let i=0; i<apiIDs.length; i++){
      const apiID = apiIDs[i].apiID;
      const res = await fetch(`http://127.0.0.1:5000/api/books/book?q=${apiID}`);
      const data = await res.json();

      const coverUrl = data.coverId
        ? `https://covers.openlibrary.org/b/id/${data.coverId}-M.jpg`
        : "";

      addBook("recentlyViewed", coverUrl, apiID);
    };
});