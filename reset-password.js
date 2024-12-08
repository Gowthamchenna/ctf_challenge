document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    const response = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            token: token,
            newPassword: document.getElementById('new-password').value
        })
    });
    const result = await response.json();
    document.getElementById('message').textContent = result.message || result.error;
});