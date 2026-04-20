const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value;

  const res = await fetch(`http://localhost:5000/api/books?q=${query}`);
  const books = await res.json();

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