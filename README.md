# Nahom Wondimu Portfolio

Security developer portfolio and research hub. Built with HTML, CSS, and vanilla JavaScript.

## Project Structure

**Frontend** (`src/frontend/`)
- `index.html` - Home/landing page
- `writeups.html` - Security research writeups and vulnerability analyses
- `post.html` - Individual post viewer (loads markdown from `posts/`)
- `feed.html` - Threat intelligence feed aggregator

**Backend** (`src/backend/`)
- Placeholder for RSS feed proxy and API endpoints

**Content** (`posts/`)
- Markdown files for security writeup content
- `images/` - Images used in posts

## Quick Start

1. Serve the frontend files from `src/frontend/`
2. Posts are loaded dynamically from `posts/` directory
3. To add a new writeup:
   - Create a `.md` file in `posts/` with frontmatter:
     ```markdown
     ---
     title: Your Post Title
     date: YYYY-MM-DD
     category: vuln
     tags: [tag1, tag2]
     readtime: 15
     ---
     Your markdown content here...
     ```
   - Link to it via `post.html?slug=your-filename`

## Features

- Dark-themed security developer portfolio
- Vulnerability research writeup showcase
- Threat intelligence feed aggregator (RSS)
- Mobile responsive design
- Dynamic content loading from markdown files

## Browser Support

Modern browsers with ES6 support. Uses marked.js for markdown rendering.
