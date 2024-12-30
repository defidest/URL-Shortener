require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const urlDatabase = {}; // In-memory storage for URLs
let counter = 1; // Counter for generating short URLs

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: true }));

// app.post('/api/shorturl', (req, res) => {
//   // console.log(req.body);
//   res.json({
//     urlGot: req.body
//   });
// });

// app.get('/api/shorturl/:shorturl', (req, res) => {

// });

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!/^https?:\/\//.test(originalUrl)) {
    return res.json({ error: 'Invalid URL' });
  }

  // Check if the URL already exists
  const existingKey = Object.keys(urlDatabase).find(
    key => urlDatabase[key] === originalUrl
  );

  if (existingKey) {
    return res.json({ original_url: originalUrl, short_url: existingKey });
  }

  // Store the new URL with a unique number
  const shortUrl = counter++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET route to redirect using the short URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
