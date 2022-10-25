const path = require('path')
function getFilePath (tp) {
  return path.dirname(tp.file.path(true)).replace(' ', '_')
}
module.exports = getFilePath
