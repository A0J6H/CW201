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

function displayBooks(books) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  books.forEach(book => {
    console.log(book.title)
    const div = document.createElement("div");

    const coverUrl = book.coverId
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
      : "";

    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author || "Unknown author"}</p>
      <p>${book.year || "No year available"}</p>
      ${coverUrl ? `<img src="${coverUrl}" />` : ""}
    `;
    div.addEventListener("click", async () => {
      createReview(book.key);
    })
    container.appendChild(div);
  });
}


const profileBtn = document.getElementById("profileBtn");

profileBtn.addEventListener("click", async () => {
  console.log("presed")
  window.location.href = "profile.html";
})

function addBook(div,coverUrl,book) {
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

      addBook("recentlyViewed",coverUrl,apiID);
    };
});