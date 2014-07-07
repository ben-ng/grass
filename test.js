/* jshint evil:true */

var test = require('tape')
  , lexerLib = require('./lib/index.js')
  , Fragment = require('finite-automata')
  , nfa = new Fragment({
              initial: '0'
            , accept: ['token']
            , transitions: {
                '0': [
                      '\0', '1'
                    , '\0', '3'
                    ]
              , '1': [
                      'b', '2'
                    ]
              , '2': [
                      '\0', '5'
                    ]
              , '3': [
                      'a', '4'
                    ]
              , '4': [
                      '\0', '5'
                    ]
              , '5': [
                      '\0', '6'
                    , '\0', '0'
                    ]
              , '6': [
                      'b', '7'
                    ]
              , '7': [
                      'c', '8'
                    ]
              , '8': [
                      '\'', 'token'
                    ]
              , 'token': [
                      'a', '0'
                    , 'b', '0'
                    , 'c', '0'
                    , 'd', '0'
                    , 'e', '0'
                    , 'f', '0'
                    , 'g', '0'
                    , 'h', '0'
                    , 'i', '0'
                    , 'j', '0'
                    , 'k', '0'
                    , 'l', '0'
                    , 'm', '0'
                    , 'n', '0'
                    , 'o', '0'
                    , 'p', '0'
                    , 'q', '0'
                    , 'r', '0'
                    , 's', '0'
                    , 't', '0'
                    , 'u', '0'
                    , 'v', '0'
                    , 'w', '0'
                    , 'x', '0'
                    , 'y', '0'
                    , 'z', '9'
                    ]
              , 9: [] //Deadend state
              }
            })
    // Valid tokens
  , v0 = 'bbc\''
  , v1 = 'abc\''
  , tokens = ['  ', v0, '2 \'3', v1, '\'sf', v0, 'a\'sf', v1, 'y', v0, 'a', v1, 'turkey', v0, 'dangle'].join('')
  , f = 'token'
  , expected = [[f, v0], [f, v1], [f, v0], [f, v1+'y'+v0+'a'+v1], [f, v0]]

test('lexer (sync)', function (t) {
  t.plan(3)

  // Example taken from:
  // http://binarysculpting.com/2012/02/15/converting-dfa-to-nfa-by-subset-construction-regular-expressions-part-2

  var lexer = lexerLib.sync(nfa)
    , diffNfa = new Fragment({
        initial: 'empty'
      , accept: ['empty']
      , transitions: {empty: ['a', 1], 1: ['b', 'empty']}
      })

  t.deepEqual(lexer(tokens), expected, 'check lexer on input')

  lexer = lexerLib.sync(diffNfa)

  t.deepEqual(lexer('    ')
    , [ [ 'empty', '' ], [ 'empty', '' ], [ 'empty', '' ], [ 'empty', '' ], [ 'empty', '' ] ]
    , 'check lexer on empty input')

  // Run without options
  t.doesNotThrow(function () {
    nfa.toString()
  })
})

test('lexer (stream)', function (t) {
  t.plan(1)

  // Example taken from:
  // http://binarysculpting.com/2012/02/15/converting-dfa-to-nfa-by-subset-construction-regular-expressions-part-2

  var lexer = lexerLib(nfa)
    , buffer = []

  lexer.on('data', function(chunk) {
    buffer.push(chunk)

    if(buffer.length === 5) {
      t.deepEqual(buffer, expected, 'check lexer on streamed input')
    }
  })

  // Slice them up to create some actual challenge
  lexer.write(tokens.slice(0,1))
  lexer.write(tokens.slice(1,4))
  lexer.write(tokens.slice(4,7))
  lexer.write(tokens.slice(7,8))
  lexer.write(tokens.slice(8,9))
  lexer.write(tokens.slice(9,12))
  lexer.write(tokens.slice(12,18))
  lexer.write('')

  for(var i=18, ii=tokens.length; i<ii; ++i) {
    lexer.write(tokens.charAt(i))
  }
})

test('greedy lexing', function (t) {
  t.plan(2)

  var nfa = new Fragment('cow', 'cow')
    , dog = new Fragment('dog', 'cowdog')
    , cat = new Fragment('cat', 'cowdogcat')
    , pieces = ['cowdogcat', 'cowdog', 'cowcat', 'dog', 'cowcatcat', 'cowdogcatcat'].join('')
    , expected = [
        [ '0``౹cowdogcat', 'cowdogcat' ]
      , [ '0`౹0``౹cowdog౹repeat``', 'cowdog' ]
      , [ '0``౹cowdogcat', 'cowcat' ]
      , [ '0``౹cowdogcat', 'cowcatcat' ]
      , [ '0``౹cowdogcat', 'cowdogcatcat' ]
      ]
    , lexer
    , buffer = []

  // Match cow followed by any number of dogs then any number of cats
  nfa.concat(dog.repeat()).concat(cat.repeat())

  t.deepEqual(lexerLib.sync(nfa)(pieces), expected, 'check sync lexer on input')

  lexer = lexerLib(nfa)

  lexer.on('data', function(chunk) {
    buffer.push(chunk)

    if(buffer.length === 5) {
      t.deepEqual(buffer, expected, 'check lexer on streamed input')
    }
  })

  lexer.write(pieces.slice(0,1))
  lexer.write(pieces.slice(1,4))
  lexer.write(pieces.slice(4,7))
  lexer.write(pieces.slice(7,8))
  lexer.write(pieces.slice(8,9))
  lexer.write(pieces.slice(9,12))
  lexer.write(pieces.slice(12,18))
  lexer.write('')
  for(var i=18, ii=pieces.length; i<ii; ++i) {
    lexer.write(pieces.charAt(i))
  }
  lexer.end()
})
