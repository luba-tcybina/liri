require("dotenv").config();

const axios = require("axios");
const moment = require('moment');
const fs = require('fs');

function getUserArguments() {
  return process.argv.slice(2);
}

function getSearchType() {
  return getUserArguments()[0];
}

function getSearchTerm() {
  return getUserArguments().slice(1).join('+');
}

function searchType(searchType, searchTerm) {
  switch (searchType) {
    case 'spotify-this-song':
      spotifyThisSong(searchTerm);
      break;
    case "concert-this":
      concertThis(searchTerm);
      break;
    case "movie-this":
      movieThis(searchTerm);
      break;
    default:
      doWhatItSays();
  }
}

function movieThis(movie) {
  if (!movie) {
    movie = "Mr. Nobody";
  }
  // Use axios to search OMDB for film info
  axios.get("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy").then(
    function (response) {
      // Then print out the results
      var title = "Film Title: " + response.data.Title;
      var year = "Year Released: " + response.data.Year;
      var imdb = "IMDB Rating: " + response.data.imdbRating;
      var rotten = "Rotten Tomatoes Rating: " + response.data.Metascore;
      var country = "Country: " + response.data.Country;
      var language = "Language: " + response.data.Language;
      var plot = "Plot: " + response.data.Plot;
      var cast = "Cast: " + response.data.Actors;
      var output = title + "\n" + year + "\n" + imdb + "\n" + rotten + "\n" + country + "\n" + language + "\n" + plot + "\n" + cast;
      console.log(output);
      logData(output);

    }
  );
};

// concert-this

function concertThis(artist) {
  if (!artist) {
    artist = "Adam Lambert";
  }
  axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
    .then(
      function (response) { logConcerts(response) }
      )
      
      .catch(function (err) {
      console.log(err);
    });
};

function logConcerts(response) {
  const array = response.data;
  for (let index = 0; index < array.length; index++) {
  
    var path = response.data[index];
    var group = path.lineup;
    var venue = path.venue.name;
    var location = path.venue.city + ", " + path.venue.country;
    // * Date of the Event (use moment to format this as "MM/DD/YYYY")
    var date = moment(path.datetime).format("MM/DD/YYYY");
    var output = "Artist: " + group + "\nVenue: " + venue + "\nLocale: " + location + "\nDate: " + date + "\n-----";
    console.log(output);
    logData(output);
  }};

// do-what-it-says
function doWhatItSays() {
  fs.readFile('./random.txt', 'utf8', function (err, data) {
    if (err) throw err;
    var action = getAction(data);

    function getAction(data) {
      return data.split(",").slice(0, 1);
    }
    var song = getSong(data);

    function getSong(data) {
      return data.split(",").slice(1);
    }
    spotifyThisSong(song);
    // searchType(action, song);
  });
};

function spotifyThisSong(songTitle) {
  var Spotify = require('node-spotify-api');
  var keys = require("./keys.js");
  var spotify = new Spotify(keys.spotify);
  if (!songTitle) {
    songTitle = "The Sign Ace of Base";
  }
  spotify.search({
      type: 'album,artist,track',
      query: songTitle,
      limit: 1
    })
    .then(function (response) {
      var path = response.tracks.items[0];
      var artist = path.artists[0].name;
      var song = path.name;
      var link = path.preview_url;
      var album = path.album.name;
      var output = "Artist: " + artist + "\nSong: " + song + "\nPreview: " + link + "\nAlbum: " + album;
      console.log(output);
      logData(output);
    })
    .catch(function (err) {
      console.log(err);
    });
}

function logData(data) {
  fs.appendFile('log.txt', data + "\n", function (err) {
    if (err) throw err;
    // console.log('Saved!');
  });
}
searchType(getSearchType(), getSearchTerm());
logData("\nRequest: " + process.argv.slice(2));