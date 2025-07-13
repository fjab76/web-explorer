'use strict';

const express = require('express');
const session = require('express-session');
const pageReader = require('./pageReader');

const app = express();

// Simple in-memory user store for demonstration
const users = {
  'admin': 'password123',
  'user': 'mypass'
};

// Session configuration
app.use(session({
  secret: 'web-explorer-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.send(`
      <h1>Welcome to Web Explorer</h1>
      <p>Hello, ${req.session.user}!</p>
      <form action="/explore" method="post">
        <label>URL to explore:</label>
        <input type="url" name="url" value="http://stackoverflow.com/" required>
        <label>Depth (0-2):</label>
        <input type="number" name="depth" value="0" min="0" max="2" required>
        <button type="submit">Explore</button>
      </form>
      <p><a href="/logout">Logout</a></p>
    `);
  } else {
    res.send(`
      <h1>Web Explorer Login</h1>
      <form action="/login" method="post">
        <label>Username:</label>
        <input type="text" name="username" required>
        <label>Password:</label>
        <input type="password" name="password" required>
        <button type="submit">Login</button>
      </form>
      <p>Try: admin/password123 or user/mypass</p>
    `);
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send(`
      <h1>Login Failed</h1>
      <p>Invalid username or password</p>
      <p><a href="/">Try again</a></p>
    `);
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.post('/explore', requireAuth, (req, res) => {
  const { url, depth } = req.body;
  const depthLimit = parseInt(depth) || 0;
  
  pageReader.getAllLinks(url, depthLimit, (err, links) => {
    if (err) {
      res.status(500).json({ error: 'Failed to explore URL' });
    } else {
      res.send(`
        <h1>Exploration Results</h1>
        <p>Found ${links.length} links from ${url} (depth: ${depthLimit})</p>
        <ul>
          ${links.map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join('')}
        </ul>
        <p><a href="/">Back to Explorer</a></p>
      `);
    }
  });
});

// API endpoints for programmatic access
app.get('/api/status', (req, res) => {
  res.json({ 
    authenticated: !!(req.session && req.session.user),
    user: req.session ? req.session.user : null
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.json({ success: true, user: username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.post('/api/explore', requireAuth, (req, res) => {
  const { url, depth } = req.body;
  const depthLimit = parseInt(depth) || 0;
  
  pageReader.getAllLinks(url, depthLimit, (err, links) => {
    if (err) {
      res.status(500).json({ error: 'Failed to explore URL' });
    } else {
      res.json({ links, count: links.length, depth: depthLimit });
    }
  });
});

function startServer(port = 3000) {
  const server = app.listen(port, () => {
    console.log(`Web Explorer server running on http://localhost:${port}`);
  });
  return server;
}

module.exports = { app, startServer };