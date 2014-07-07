/* jshint evil:true */

var through = require('through')
  , hbs = require('handlebars')
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

template = hbs.compile(fs.readFileSync(__dirname + '/lexerStream.hbs').toString())

function createStream (def) {
  var ctx = context(def)
    , inverseStateMap = ctx.inverseStateMap
    , process = new Function(template(ctx))()

  function write (data) {
    var results = process(data)
      , i = 0
      , ii = results.length

    for(; i<ii; ++i) {
      results[i][0] = inverseStateMap[results[i][0]]
      this.queue(results[i])
    }
  }

  function end () {
    var results = process(null)
      , i = 0
      , ii = results.length

    for(; i<ii; ++i) {
      results[i][0] = inverseStateMap[results[i][0]]
      this.queue(results[i])
    }
  }

  return through(write, end)
}

module.exports = createStream
