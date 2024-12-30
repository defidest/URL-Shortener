require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI);


const Url = require('./models/url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST: Create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  // Validate URL format
  const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if URL already exists
    let existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url,
      });
    }

    // Generate short URL ID
    const count = await Url.countDocuments();
    const shortUrl = count + 1;

    // Save URL to database
    const newUrl = new Url({ original_url: url, short_url: shortUrl });
    await newUrl.save();

    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

// GET: Redirect to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    const urlData = await Url.findOne({ short_url });
    if (!urlData) {
      return res.json({ error: 'No short URL found for the given input' });
    }

    res.redirect(urlData.original_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
