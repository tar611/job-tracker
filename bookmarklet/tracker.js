// Job Tracker bookmarklet — readable source.
// This isn't run directly; install.html minifies + URL-encodes it into a
// "javascript:" link you drag to your bookmarks bar. Edit API_URL below
// and regenerate install.html if you move the backend (e.g. after deploying).
(function () {
  var API_URL = "http://localhost:4000";

  // Best-effort guess from the page title, e.g. "Software Engineer - Acme | LinkedIn"
  var title = document.title;
  var parts = title.split(/\s[-|]\s/);
  var guessRole = parts.length >= 2 ? parts[0].trim() : title;
  var guessCompany = parts.length >= 2 ? parts[1].trim() : "";

  // Both prompts return null if the user hits Cancel — bail out if so.
  var company = prompt("Company?", guessCompany);
  if (company === null) return;
  var role = prompt("Role?", guessRole);
  if (role === null) return;

  fetch(API_URL + "/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company: company, role: role, source: location.href }),
  })
    .then(function (res) {
      if (res.ok) return alert("Added to Job Tracker ✅");
      return res.json().then(function (body) {
        alert("Failed: " + (body.error || res.status));
      });
    })
    .catch(function (err) {
      alert("Failed: " + err.message + "\n\nIs the backend running?");
    });
})();
