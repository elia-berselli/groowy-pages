(() => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error_description");
  const errorBox = document.getElementById("errorBox");

  if (error && errorBox) {
    errorBox.textContent = error.replace(/\+/g, " ");
    errorBox.hidden = false;
  }

  if (!error && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    window.location.replace(
      `groowy://auth-callback${window.location.search}${window.location.hash}`,
    );
  }
})();
