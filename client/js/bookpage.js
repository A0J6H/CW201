const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    console.log(bookId);

    const res = await fetch(`http://localhost:5000/api/books/book?q=${bookId}`);
    const data = await res.json();

    console.log(data.title);
    
});