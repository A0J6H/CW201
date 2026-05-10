// --- displays relevant user details if user logged in + log out option ---

document.addEventListener("DOMContentLoaded", async () => {

    // grab the token from local storage (saved in authentication.js)
    const token = localStorage.getItem("token");

    if (!token) {
        // no token means not logged in, send them back to login
        window.location.href = "index.html";
        console.log("no token detected");
        return;
    }
    

    try {
        // send a request for profile, includes the JWT in the header
        // route is: profile.js -> authmiddleware.js -> auth.js if successful
        // because we're using refresh tokens, we need a fetchWithAuth instead of fetch
        const res = await fetchWithAuth("http://localhost:5000/auth/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        const data = await res.json();

        if (res.ok) {
            // if token valid, display details
            document.getElementById("username").textContent = `${data.username}'s library`;
            // the raw createdAt datetime comes out a little odd-looking, keep only the first 10 chars
            const formattedDate = data.createdAt.slice(0,10)
            document.getElementById("createdDate").textContent = `${formattedDate}`;
            document.getElementById("numBooks").textContent = `Number of books reviewed: ${data.books.length}`;
            //get id=favouriteBooks - set href review page
            let template = document.getElementById("bookTemplate");

            //for id=bookContainer
            //get each id=bookTitle, bookCover - set href review page, bookRating, bookReview
            let sum = 0;
            for (const book of data.books) {
                let clone = template.content.cloneNode(true);
                clone.getElementById("bookTitle").textContent = `${book.title}`;
                clone.getElementById("bookCover").src = `https://covers.openlibrary.org/b/olid/${book.cover}-M.jpg`;
                clone.getElementById("bookCover").addEventListener("click", () => {
                    window.location.href = `bookpage.html?id=${book.bookID}`
                })
                clone.getElementById("bookReview").textContent = `${book.review}`;
                clone.getElementById("bookRating").textContent = `${book.rating}/5`;
                sum+= book.rating;
                document.getElementById("bookDisplayContainer").appendChild(clone);
            }
            console.log(data.books);
            //get average rating across all books, round to 1 decimal place
            let avgRating = sum / data.books.length;
            document.getElementById("avgRating").textContent = `Average rating: ${ avgRating.toFixed(1) }/5`;

            // get highest rated book and display as favourite book
            let booksSorted = data.books.sort((a, b) => b.rating - a.rating);
            document.getElementById("favouriteBooks").textContent = `${booksSorted[0].title}`;
            

            
        } 
        
        else {
            // if token invalid or expired, remove from local storage and go back to log in page
            console.log("Profile fetch failed with status:", res.status);
            localStorage.removeItem("token");
            window.location.href = "index.html";
        }
    } catch (err) {
        // for general network errors, although this should be rarely triggered
        console.error(err);
    }
});

document.getElementById("redirectBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

// log out: get rid of the token and direct the user back to the log in page
document.getElementById("logoutBtn").addEventListener("click", async () => {

    // remove refresh token (via auth.js)
    await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    // remove the regular access token
    localStorage.removeItem("token");
    console.log("pressing log out")
    window.location.href = "index.html";
});