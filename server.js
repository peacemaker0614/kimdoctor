// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/kimdoctor', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const PostSchema = new mongoose.Schema({
    author: String,
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(200).send({ token });
    } else {
        res.status(401).send({ error: 'Invalid credentials' });
    }
});

app.post('/api/posts', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const post = new Post({
            author: decoded.userId,
            title: req.body.title,
            content: req.body.content,
        });
        await post.save();
        res.status(201).send({ message: 'Post created successfully' });
    });
});

app.get('/api/posts', async (req, res) => {
    const posts = await Post.find();
    res.status(200).send(posts);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
