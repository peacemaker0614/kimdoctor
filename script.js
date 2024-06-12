document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('post-list-body')) {
        loadPosts();
    }
});

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('회원가입 성공');
    } else {
        alert(data.error);
    }
}

async function loadPosts() {
    const response = await fetch('http://localhost:5000/api/posts');
    const posts = await response.json();

    const postListBody = document.getElementById('post-list-body');
    postListBody.innerHTML = '';

    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post._id}</td>
            <td>${post.title}</td>
            <td>${post.author}</td>
            <td>${new Date(post.date).toLocaleString()}</td>
            <td>0</td>
        `;
        postListBody.appendChild(row);
    });
}
