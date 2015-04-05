var request = require('request');
var fs = require('fs');
var lwip = require('lwip');
var config = require('./config');

var tileUntilFull = function(container, tile, x, y, cb){
  var containerWidth = container.width()
  var containerHeight = container.height()
  var tileWidth = tile.width()
  var tileHeight = tile.height()

  var cropx
  var cropy

  var newWidth = tileWidth - 1
  var newHeight = tileHeight - 1

  if ((tileWidth + x) > containerWidth) {
    newWidth = containerWidth - x - 1
    cropx = true
  }

  if ((tileHeight + y) > containerHeight) {
    newHeight = containerHeight - y - 1
    cropy = true
  }

  if (newWidth == -1) {
    return tileUntilFull(container, tile, 0, y+tileHeight, cb)
  }

  if (newHeight == -1){
    return cb(null, container)
  }

  if (cropx || cropy) {
    tile.extract(0, 0, newWidth, newHeight, function(err, cropped){
      if (err) {
        return cb(err)
      }

      container.paste(x, y, cropped, function(err, container){
        if (err) {
          return cb(err)
        }
        if (!cropx) {
          tileUntilFull(container, tile, x+tileWidth, y, cb)
        } else if (!cropy) {
          tileUntilFull(container, tile, 0, y+tileHeight, cb)
        } else {
          cb(null, container)
        }
      })
    })
  } else {
    container.paste(x, y, tile, function(err, container){
      if (err) {
        return cb(err)
      }
      tileUntilFull(container, tile, x+tileWidth, y, cb)
    })
  }
}

var tiledImageAtResolution = function(path, image, width, height, cb){
  lwip.create(width, height, function(err, target){
    if (err) {
      return cb(err)
    }

    tileUntilFull(target, image, 0, 0, function(err, target){
      if (err) {
        return cb(err)
      }
      target.writeFile(path, function(err){
        cb(err)
      })
    })
  })
}

var downloadAndSave = function(url, path, cb, options){
  options || (options = {})
  var imageType = 'jpg'
  if (!url.match(/\.jpg$/)) {
    imageType = url[url.length-3] + url[url.length-2] + url[url.length-1]
  }
  request(url).pipe(fs.createWriteStream(path))
  .on('error', function(err){
    cb(err)
  })
  .on('finish', function(){
    if (options.tile) {
      lwip.open(path, imageType, function(err, image){
        if (err) {
          return cb(err)
        }
        tiledImageAtResolution(path, image, config.outputResolution.width, config.outputResolution.height, cb)
      })
    } else {
      cb(null)
    }
  })
}

module.exports = {
  downloadAndSave: downloadAndSave
}