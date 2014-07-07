var lexerStream = require('./lexerStream')
  , syncLexer = require('./syncLexer')

module.exports = function createStream (fragment) {
  return lexerStream(fragment.minimize())
}

module.exports.sync = function createSync (fragment) {
  return syncLexer(fragment.minimize())
}
