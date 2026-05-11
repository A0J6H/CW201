const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
let userID;


document.addEventListener("DOMContentLoaded", async () => {
    console.log(bookId);
    const token = localStorage.getItem("token");
    
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
            console.log("userData:", data.userID);
            userID = data.userID;
    } catch (err) {
        // for general network errors, although this should be rarely triggered
        console.error(err);
    }

    const coverImage = document.getElementById("bookCover");

    const res = await fetch(`http://127.0.0.1:5000/api/books/book?q=${bookId}`);
    const data = await res.json();

    document.getElementById("bookTitle").textContent = data.title;
    document.getElementById("bookDescription").textContent = data.description;

    coverImage.alt = data.title;

    const coverUrl = data.coverId
      ? `https://covers.openlibrary.org/b/id/${data.coverId}-M.jpg`
      : "";

    coverImage.src = coverUrl;

    fetch("http://127.0.0.1:5000/api/books/dbCheck", {//Checks to see if the book alreaedy exists in the db, If not inserts it
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        title: data.title,
        author: data.authorKey,
        cover: data.coverId,
        apiID: bookId,
        userID: userID
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })


    .catch(err => console.error(err));

        


});

document.getElementById("submitReview").addEventListener("click", async () => {
    review = document.getElementById("reviewInput").value;
    rating = document.getElementById("ratingInput").value;
    if (rating < 1 || rating > 5 || rating === "" || review === "") {
        alert("Please fill out the review form correctly! (Rating must be between 1 and 5, review cannot be empty)");
        return;
    }

    const response = await fetch(
    `http://localhost:5000/api/books/bookID?q=${bookId}`
    );

    console.log("bookID response:", response);
    const data = await response.json();
    console.log("bookID data:", data);
    console.log("userID:", userID, "bookID:", data[0].bookID, "review:", review, "rating:", rating);

    fetch("http://localhost:5000/api/books/reviewInsert", {//Adds the review to the mysql db
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        userID: userID,
        bookID: data[0].bookID,
        status: "read",
        review: review,
        rating: rating,
        })//userID, bookID, status, review, rating
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(err => console.error(err));
});