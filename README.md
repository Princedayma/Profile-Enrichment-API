# Profile Enrichment API

A simple and robust Node.js service that enriches user data by scraping a full name from a given public URL. This project includes a backend API built with Express.js and a clean frontend for easy interaction. It is configured for seamless serverless deployment on Vercel.

## Features

- **Profile Enrichment**: Accepts user data and a URL, scrapes the `<h1>` tag from the URL, and returns a combined, enriched profile.
- **Dynamic Profile Pages**: Can generate simple, shareable HTML profile pages on the fly (e.g., `/:name.html`).
- **Robust Error Handling**: Gracefully handles invalid inputs, network errors, and scraping failures.
- **Static Frontend**: A simple and clean HTML/CSS/JS interface to interact with the API.
- **Serverless Ready**: Pre-configured with a `vercel.json` file for easy deployment.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Scraping**: Axios, Cheerio
- **Deployment**: Vercel

## API Documentation

### Enrich a User Profile

Enriches a user profile by scraping the `<h1>` tag from the provided `profileUrl`.

- **Endpoint**: `POST /users/enrich`
- **Request Body**: `application/json`

  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "profileUrl": "https://<your-deployed-app-url>/test-profile.html"
  }
  ```

- **Success Response (201 Created)**:

  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Scraped Name from H1",
    "sourceProfile": "https://<your-deployed-app-url>/test-profile.html"
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: If `username`, `email`, or `profileUrl` are missing.
  - `404 Not Found`: If an `<h1>` tag could not be found on the target page.
  - `502 Bad Gateway`: If the target server responds with an error.
  - `504 Gateway Timeout`: If the request to the `profileUrl` times out.

### Get a Dynamic Profile Page

Generates and serves a simple HTML profile page.

- **Endpoint**: `GET /:name.html`
- **Example**: `GET /prince-dayma.html?email=prince@example.com`
- **Response**: An HTML page with the name "Prince Dayma" in the `<h1>` tag and the provided email.

## Local Development Setup

To run this project on your local machine, follow these steps.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Princedayma/Profile-Enrichment-API.git
    cd Profile-Enrichment-API
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    This will start the server with `nodemon`, which automatically restarts on file changes.
    ```sh
    npm run dev
    ```

4.  **Open the application:**
    The server will be running at `http://localhost:3000`. You can access the frontend by navigating to this URL in your browser.

## Deployment

This project is configured for one-click deployment on Vercel.

1.  Push your code to a GitHub repository.
2.  Import the repository into Vercel.
3.  Vercel will automatically detect the `vercel.json` file and deploy the application as a serverless function.

The `vercel.json` file ensures that:
- The Node.js server (`index.js`) is used as the build target.
- All required static files from the `/public` directory are included in the deployment.
- All incoming requests are routed to the Express application for processing.

## How to Use

1.  Navigate to the deployed application URL or `http://localhost:3000`.
2.  The form will be pre-populated with default values. The "Profile URL" field will point to a test page hosted by the application itself.
3.  Click the **"Enrich Profile"** button.
4.  The enriched data, including the scraped `fullName`, will appear in the result box below the form.
