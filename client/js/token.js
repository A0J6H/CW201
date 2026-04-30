// --- handles automatically refreshing access token if it expires and the refresh token is still valid ---

const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("token");

    // add the access token to the request in regular format
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };
    options.credentials = "include"; // always send cookies as well

    let res = await fetch(url, options);

    // when testing tokens, i ran into a few 403's and couldn't find the direct cause, so here's a fix to handle them:
    // if it 403's, try refreshing the token first
    if (res.status === 403) {
        const refreshRes = await fetch("http://localhost:5000/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("token", data.token); // store new access token

            // retry the original request with the new token
            options.headers["Authorization"] = `Bearer ${data.token}`;
            res = await fetch(url, options);
        } 

        else {
            // refresh failed, send the user back to the login page and have them make new tokens upon their next log in
            localStorage.removeItem("token");
            window.location.href = "index.html";
        }
    }

    return res;
};