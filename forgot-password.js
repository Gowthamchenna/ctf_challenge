document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('email').value
        })
    });
    const result = await response.json();
    document.getElementById('message').textContent = result.message || result.error;
});