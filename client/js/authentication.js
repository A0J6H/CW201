// --- front-end code for log in/sign-up --- //

// --- NOTE: ---
// live-server is buggy with cookies, so when you log out from an account, it won't delete...
//... the data in refresh_tokens for that account
// works fine when accessing the server regularly, i'll see if i can fix it in the future

// only redirect if served through Express (localhost:5000)
// live Server users (port 8080) skip this check
if (window.location.port === "5000" && localStorage.getItem("token")) {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const isExpired = payload.exp * 1000 < Date.now();

  if (!isExpired) {
    window.location.href = "dashboard.html";
  } else {
    localStorage.removeItem("token");
  }
}


// redirect to dashboard if already logged in
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

document.getElementById("next").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

document.getElementById("dbTest").addEventListener("click", () => {
  fetch("http://127.0.0.1:5000/auth/users")
  .then(res => res.json())
  .then(data => {
    const users = data; // all users stored in a variable

    console.log(users);

    const usernames = users.map(user => user.username);
    const emails = users.map(user => user.email);

    console.log(usernames);
    console.log(emails);
  })
  .catch(err => console.error(err));
});


// --- sign up handler ---
document.getElementById("signUpBtn").addEventListener("click", async () => {

  // trim gets rid of additional whitespace, ensures "  bob  " and "bob" aren't made as separate accounts
  const username = document.getElementById("signUpUser").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();

  const password = document.getElementById("signUpPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  try {
  const res = await fetch("http://127.0.0.1:5000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, confirmPassword })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message); // returns "Account successfully created"
  }
  else {
    alert(data.error); //returns whatever error it runs into in auth.js
  }


  } catch (err){
    console.error(err);
    alert("Something went wrong, please try again later! (Create account error)")
  }

})



// --- log in handler ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const identifier = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    console.log("Login response:", data)

    if (res.ok) {
      //alert(data.message); // returns "Valid credentials!"

      localStorage.setItem("token", data.token); // save token into browser's local storage
      window.location.href = "dashboard.html"; //redirect to dashboard
      console.log("Token:", data.token);
    } 

    else {
      alert(data.error); // returns "Invalid credentials"
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong, please try again later! (Log in error)");
  }
});