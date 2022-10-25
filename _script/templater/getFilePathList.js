const path = require('path')
function getFilePathList (tp) {
  return path.dirname(tp.file.path(true)).replace(' ', '_').split('/').join("','")
}
module.exports = getFilePathList
