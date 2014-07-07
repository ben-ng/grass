/* jshint evil:true */

var hbs = require('handlebars')
  , fs = require('fs')
  , context = require('./context')
  , template

hbs.registerPartial('fallbackPartial'
  , fs.readFileSync(__dirname + '/partials/fallback.hbs').toString())
hbs.registerPartial('manyTransitionsPartial'
  , fs.readFileSync(__dirname + '/partials/many.hbs').toString())
hbs.registerPartial('severalTransitionsPartial'
  , fs.readFileSync(__dirname + '/partials/several.hbs').toString())
hbs.registerPartial('oneTransitionPartial'
  , fs.readFileSync(__dirname + '/partials/one.hbs').toString())
hbs.registerPartial('noTransitionsPartial'
  , fs.readFileSync(__dirname + '/partials/none.hbs').toString())

template = hbs.compile(fs.readFileSync(__dirname + '/syncLexer.hbs').toString())

function syncLexer (def) {
  var ctx = context(def)
    , inverseStateMap = ctx.inverseStateMap
    , lex = new Function('input', template(ctx))

  return function lexer (input) {
    var results = lex(input)
      , i = 0
      , ii = results.length

    for(; i<ii; ++i) {
      results[i][0] = inverseStateMap[results[i][0]]
    }

    return results
  }
}

module.exports = syncLexer
