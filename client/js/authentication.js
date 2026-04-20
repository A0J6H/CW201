//This js file will contain the front end code for the login/signup page//
document.getElementById("next").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

document.getElementById("dbTest").addEventListener("click", () => {
  fetch("http://localhost:5000/auth/users")
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



