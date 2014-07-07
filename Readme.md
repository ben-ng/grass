# Grass

A greedy, streaming lexer written in vanilla Javascript.

## Features

 * Fixed memory usage regardless of input size
 * Emits both token type and matched text
 * 100% statement and branch coverage

## Usage

```javascript

var grass = require('grass')
  , Fragment = require('finite-automata')
  , fs = require('fs')
  , red
  , blue
  , dog
  , rule
  , lexerStream

// Make a DFA that matches /(red|blue)dog/ and labels it 'animalToken'
red = new Fragment('red')
blue = new Fragment('blue')
dog = new Fragment('dog', 'animalToken')

rule = red.copy().union(blue).concat(dog)

fs.createReadStream('input.txt')
  .pipe(grass(rule))
  .pipe(consumer)

// consumer will recieve tuple ['animalToken', match <string>] for every match

```

## Sync API

```javascript

grass.sync(ruleA)('reddogredcatbluedog')
// ==> '[['animalToken', 'reddog'], ['animalToken, 'bluedog']]'

```

## Greediness

Say you have a rule like `/11*2*3*4*5*6*7*8*9*/`. This matches ascending series of digits that start with 1.

Example matches: `1`, '1234', '11223', '199'

Grass is *greedy*. This means that it will try to match as much text as possible, and only backtrack when it has no way to continue.

This means that grass might not emit a match at the end of the stream's `data` event. Sending an ascending series like `123` to grass will not result in a match until the stream is ended, or a digit lesser than 3 occurs. This is because grass knows that there is a possibility of a longer match, and it will wait for the next `data` event to decide on the fate of the data in its internal buffer.

This is expected behavior, because if the series `1234` was sent in two parts, `12` and `34`, it should only result in one match.
