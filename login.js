document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });
    const result = await response.json();
    document.getElementById('message').textContent = result.message || result.error;
    if (result.flag) {
        document.getElementById('message').textContent += ` Flag: ${result.flag}`;
    }
});