# web-explorer
Nodejs application to collect links

## Features
- **CLI Mode**: Command-line interface for collecting links from web pages
- **Web Mode**: Web interface with user authentication for interactive link exploration

## Installation
```bash
npm install
```

## Usage

### CLI Mode (Original)
```bash
npm start
```
This will collect links from http://stackoverflow.com/ with depth 0.

### Web Mode (New)
```bash
npm run web
```
This starts a web server on http://localhost:3000 with login functionality.

**Default Users:**
- Username: `admin`, Password: `password123`
- Username: `user`, Password: `mypass`

### Web Interface Features
- User authentication with session management
- Interactive form for URL exploration
- Configurable depth settings (0-2)
- Both HTML and JSON API endpoints
- Logout functionality

## API Endpoints
- `GET /api/status` - Check authentication status
- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout current user
- `POST /api/explore` - Explore URLs (requires authentication)

## Testing
```bash
npm test
```

## Screenshots
![Login Page](https://github.com/user-attachments/assets/c7aea99e-9cbd-4f44-b832-23d70543c078)
![Logged In Page](https://github.com/user-attachments/assets/528e5f93-46a7-4aa3-beaa-4499dd6f9990)
