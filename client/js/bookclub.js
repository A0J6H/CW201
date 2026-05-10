
let clubData = null;
let currentClubIndex = 0;


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
        const res = await fetchWithAuth("http://localhost:5000/api/bookclubs/userclubs", {
        method: "GET"
        });

        const data = await res.json();
        

        if (res.ok) {
            if (data.length > 0) {
                let ind = 0;
                data.forEach((club, ind) => {
                    let clubContainer = document.getElementById("sidebar");
                    let clubElement = document.createElement("h3");
                    clubElement.textContent = club.name;
                    clubElement.addEventListener("click", () => {
                        loadClubContent(clubData, ind);});

                    clubContainer.appendChild(clubElement);
                })
            clubData = data; 

            loadClubContent(clubData, 0);
        }
        

        else {
            // if token invalid or expired, remove from local storage and go back to log in page
            console.log("Club fetch failed with status:", res.status);
        }
    }
}
     catch (err) {
        // for general network errors, although this should be rarely triggered
        console.error(err);
    }
});

document.getElementById("forumBtn").addEventListener("click", async() => {
    //initiate main content container with forum 
    mainContainer = document.getElementById("mainContentContainer");
    mainContainer.innerHTML = "";

    let template = document.getElementById("forumTemplate");
    const clone = template.content.cloneNode(true);
    mainContainer.appendChild(clone);

    //add event listener for add post button, send request to add post with input content
    mainContainer.querySelector("#addPostButton").addEventListener("click", async () => {
        const title = document.getElementById("newPostTitle").value;
        const post = document.getElementById("newPostContent").value;
        const clubID = clubData[currentClubIndex].clubID;

        const response = await fetch("http://localhost:5000/api/bookclubs/addPost", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ clubID, userID: clubData[currentClubIndex].userID, title, post })
        });

        if (response.ok) {

            console.log("Post created successfully");

            document.getElementById("newPostTitle").value = "";
            document.getElementById("newPostContent").value = "";
        }
        else {
            console.error("Failed to create post");
        }
    });

    //get all forum posts
    const response = await fetch(`http://localhost:5000/api/bookclubs/getClubPosts?clubID=${clubData[currentClubIndex].clubID}`);
    const data = await response.json();

    if (response.ok) {
        //add each post to the main display container
        console.log("Posts fetch successful:", data);

        const postContainer = mainContainer.querySelector("#postContainer");

        const postTemplate = document.getElementById("postTemplate");

        data.forEach(post => {
            let clone = postTemplate.content.cloneNode(true);

            clone.querySelector("#postTitle").textContent = post.title;
            clone.querySelector("#postAuthor").textContent = `By: ${post.username}`;
            clone.querySelector("#postContent").textContent = post.post;

            mainContainer.appendChild(clone);
        })
    }
});

function loadClubContent(clubData, index) {
    //load all initial content relevant to club and display to the user
    currentClubIndex = index;
    cloneContainer = document.getElementById("cloneContainer");
    let template = document.getElementById("bookClubTemplate");
    cloneContainer.innerHTML = "";
    const clone = template.content.cloneNode(true);
    clone.getElementById("clubTitle").textContent = clubData[index].name;
    clone.getElementById("clubDescription").textContent = clubData[index].description;
    cloneContainer.appendChild(clone);
}

document.getElementById("readingBtn").addEventListener("click", async() => {
    mainContainer = document.getElementById("mainContentContainer");
    mainContainer.innerHTML = "";

    const response = await fetch(`http://localhost:5000/api/bookclubs/getClubBooks?clubID=${clubData[currentClubIndex].clubID}`);
    const data = await response.json();

    if (response.ok) {
        //add each book to the main display container
        console.log("Books fetch successful:", data);

        const bookContainer = mainContainer.querySelector("#bookContainer");

        const bookTemplate = document.getElementById("bookTemplate");

        data.forEach(book => {
            let clone = bookTemplate.content.cloneNode(true);

            clone.querySelector("#bookTitle").textContent = book.title;
            clone.querySelector("#bookCover").src = `https://covers.openlibrary.org/b/olid/${book.cover}-M.jpg`;

            mainContainer.appendChild(clone);
        })
    }
});

document.getElementById("redirectBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
});