var lastfm = require('./lastfm');
var image = require('./image');
var config = require('./config');
var desktopInterface = require('./desktop-interface');

var userID = config.userID
var artworkFolder = config.artworkPath


var nextSong = function(err, song){
  if (err) {
    return console.log("error getting current song:", err)
  }

  desktopInterface.desktopNotification({title: 'Track: '+song.name, body: 'Album: '+song.album, subtitle: 'Artist: '+song.artist}, function(err, response){
    if (err) console.log("error notifying song change", err)
  })

  if (!song.albumUrl || !song.albumUrl.length) {
    return console.log("no albumUrl given for song", song.name)
  }

  var url = song.albumUrl
  var fname = Date.now().toString()+'.'+url[url.length-3] + url[url.length-2] + url[url.length-1]

  var albumPath = artworkFolder + fname
  image.downloadAndSave(song.albumUrl, albumPath, function(err){
    if (err) {
      console.log(err)
    } else {
      desktopInterface.setDesktopBackgroundToPath(albumPath, function(err, response){
        if (err){
          console.log("error setting desktop image", err)
        }
      })
    }
  }, {tile: true})
}

lastfm.onSongChange(userID, nextSong)