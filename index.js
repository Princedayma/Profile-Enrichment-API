const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

/**
 * @route   
 * @desc    
 * @access  Public
 */
app.post('/users/enrich', async (req, res) => {
  const { username, email, profileUrl } = req.body;

  if (!username || !email || !profileUrl) {
    return res.status(400).json({ 
      error: 'Missing required fields. Please provide username, email, and profileUrl.' 
    });
  }

  try {
    const response = await axios.get(profileUrl, {
      timeout: 15000, 
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });
    const html = response.data;

    const $ = cheerio.load(html);
    const fullName = $('h1').first().text().trim();

    if (!fullName) {
      return res.status(404).json({ 
        error: `Could not find an <h1> tag on the page at ${profileUrl}` 
      });
    }

    // --- 4. Return the enriched profile as JSON ---
    const enrichedProfile = {
      username: username,
      email: email,
      fullName: fullName,
      sourceProfile: profileUrl,
    };

    res.status(201).json(enrichedProfile);

  } catch (error) {
    console.error(`Error during profile enrichment: ${error.message}`);

    if (error.response) {
      return res.status(502).json({
        error: `Failed to fetch the profile URL. The target server responded with status: ${error.response.status}`,
        sourceUrl: profileUrl,
      });
    } else if (error.request) {
      return res.status(504).json({
        error: 'Failed to fetch the profile URL. The server did not respond or the URL is invalid.',
        sourceUrl: profileUrl,
      });
    } else {
      // Something else went wrong
      return res.status(500).json({
        error: 'An unexpected error occurred during the enrichment process.',
        details: error.message,
      });
    }
  }
});

/**
 * @route   GET /:name.html
 * @desc    Serve a dynamic profile page based on URL parameters.
 * @access  Public
 */
app.get('/:name.html', (req, res) => {
  const { name } = req.params;
  const { email, username } = req.query;

  // Convert the URL slug back to a displayable full name
  // e.g., "prince-dayma" -> "Prince Dayma"
  const fullName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Use process.cwd() to build the correct path in a serverless environment.
  const profileTemplatePath = path.join(process.cwd(), 'public', 'profile.html');

  fs.readFile(profileTemplatePath, 'utf8', (err, template) => {
    if (err) {
      console.error('Could not read profile.html template.', err);
      return res.status(500).send('Error: Could not load profile page template.');
    }

    // Replace placeholders with dynamic data
    const finalHtml = template
      .replace(/{{USERNAME}}/g, username || 'Not Provided')
      .replace(/{{FULL_NAME}}/g, fullName)
      .replace(/{{EMAIL}}/g, email || 'Not Provided');

    res.setHeader('Content-Type', 'text/html');
    res.send(finalHtml);
  });
});

const HOST = '0.0.0.0'; // Listen on all available network interfaces for deployment

app.listen(PORT, HOST, () => {
  console.log(`✅ Server is running on http://${HOST}:${PORT}`);
  console.log(`➡️  Create a dynamic profile at: http://localhost:${PORT}/index.html`);
});

// Export the Express app for Vercel
module.exports = app;
