
let clubData = null;


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
            console.log("Club fetch successful:", data);
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

document.getElementById("chatBtn").addEventListener("click", () => {
    mainContainer = document.getElementById("mainContentContainer");
    document.getElementById("mainContentContainer").innerHTML = "";
    

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

function loadClubContent(clubData, index) {
    cloneContainer = document.getElementById("cloneContainer");
    let template = document.getElementById("bookClubTemplate");
    cloneContainer.innerHTML = "";
    const clone = template.content.cloneNode(true);
    clone.getElementById("clubTitle").textContent = clubData[index].name;
    clone.getElementById("clubDescription").textContent = clubData[index].description;
    cloneContainer.appendChild(clone);
}