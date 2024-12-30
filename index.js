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

app.post('/api/shorturl', async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const shortId = await Url.countDocuments() + 1;
    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();

    res.json({ originalUrl, shortUrl: `/api/shorturl/${shortId}` });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET: Redirect to the original URL
app.get('/api/shorturl/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlEntry = await Url.findOne({ shortId: Number(shortId) });

    if (urlEntry) {
      return res.redirect(urlEntry.originalUrl);
    } else {
      return res.status(404).json({ error: 'Short URL not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
