console.log("authors.js loaded");

document.addEventListener("DOMContentLoaded", async () => { 
  const params = new URLSearchParams(window.location.search); 
  const author = params.get("author"); 

  console.log("Author name:", author); 

  const res = await fetch(`http://127.0.0.1:5000/api/authors/author?q=${encodeURIComponent(author)}`);
  const data = await res.json();
    
  document.getElementById("authorName").textContent = data.name || "Unknown Author";
  document.getElementById("authorBio").textContent = data.bio || "No biography available.";
  document.getElementById("authorBirthDate").textContent = data.birthDate
    ? `Born: ${data.birthDate}`
    : "";

  const photoUrl = data.photoId
    ? `https://covers.openlibrary.org/a/id/${data.photoId}-L.jpg`
    : ""; 

  if (photoUrl) {
    document.getElementById("authorPhoto").src = photoUrl;
    document.getElementById("authorPhoto").alt = data.name;
  }
});