const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    console.log(bookId);

    const res = await fetch(`http://localhost:5000/api/books/book?q=${bookId}`);
    const data = await res.json();

    console.log(data.title);
    console.log(data.authorKey);

    fetch("http://localhost:5000/api/books/dbCheck", {//Checks to see if the book alreaedy exists in the db, If not inserts it
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        title: data.title,
        author: data.authorKey,
        cover: data.coverId,
        apiID: bookId
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(err => console.error(err));

    
});