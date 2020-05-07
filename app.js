require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();
// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));

hbs.registerPartials(path.join(__dirname, 'views/partials'))

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/artist-search', (req, res) => {
  const term = req.query.term;
  spotifyApi
    .searchArtists(term)
    .then((data) => {
      console.log('The received data from the api: ', data.body);
      const artistData = data.body.artists.items;
      res.render('artist-search-results', { artistData });
    })
    .catch((err) => console.log('The error while searching artist occurred: ', err));
});

app.get('/albums/:artistId', (req, res, next) => {
  const artistId = req.params.artistId;
  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      console.log('Artist albums', data.body);
      const albumsInfo = data.body.items;
      res.render('albums', { albumsInfo });
    })
    .catch((err) => console.log('The error while viewing artist album occurred: ', err));
});


app.get('/tracks/:id', (req, res) => {
  const id = req.params.id;
  spotifyApi
    .getAlbumTracks(id)
    .then((data) => {
      console.log('Found playlists are', data.body);
      const trackData = data.body.items;
      res.render('tracks', { trackData })
    })
    .catch((err) => console.log('The error while viewing album tracks occurred: ', err));
});


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
