const params = new URLSearchParams(window.location.search); 
const author = params.get("author"); 
document.getElementById("authorName").textContent = author||"Unknown author";