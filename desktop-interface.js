var applescript = require('applescript');

var currentDesktopCommand = function(path){
  return  "tell application \"System Events\"\n"+
          "\ttell current desktop\n"+
          "\t\tset picture to \""+path+"\"\n"+
          "\t\tget properties\n"+
          "\tend tell\n"+
          "end tell"
}

var allDesktopsCommand = function(path){
  return  "tell application \"System Events\"\n"+
          "\tset theDesktops to a reference to every desktop\n"+
          "\trepeat with x from 1 to (count theDesktops)\n"+
          "\t\tset picture of item x of theDesktops to \""+path+"\"\n"+
          "\tend repeat\n"+
          "end tell"
}

var notifyCommand = function(body, title, subtitle){
  var command = 'display notification "'+body+'"'
  if (title) command = command + ' with title "'+title+'"'
  if (subtitle) command = command + ' subtitle "'+subtitle+'"'
  return command
}

var setDesktopToFileAtPath = function(path, cb){
  applescript.execString(allDesktopsCommand(path), cb)
}

var desktopNotification = function(options, cb){
  if (!options || !options.body) return cb("Need to specify options with at least body set")
  applescript.execString(notifyCommand(options.body, options.title, options.subtitle), cb)
}


module.exports = {
  setDesktopBackgroundToPath: setDesktopToFileAtPath,
  desktopNotification: desktopNotification
}