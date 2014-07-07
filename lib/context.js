
function context (def) {

  var k
    , i = 0
    , ii = 0
    , j = 0
    , jj = 0
    , chr
    , state
    , transitions
    , stateMap = {}
    , inverseStateMap = []
    , remapped
    , initialStateIsAccepted = (def.accept.indexOf(def.initial) >= 0)

  // Map to integer states
  for(k in def.transitions) {
    stateMap[k] = i
    inverseStateMap[i] = k
    ++i
  }

  def.initial = stateMap[def.initial]

  for(i=0, ii=def.accept.length; i<ii; ++i) {
    def.accept[i] = stateMap[def.accept[i]]
  }

  remapped = new Array(inverseStateMap.length)

  for(i=0, ii=remapped.length; i<ii; ++i) {
    transitions = def.transitions[inverseStateMap[i]]

    remapped[i] = {
      isInitialState: i === def.initial
    , initialState: def.initial
    , initialStateIsAccepted: initialStateIsAccepted
    , isAcceptedState: (def.accept.indexOf(i) > -1)
    }

    jj = transitions.length

    if(jj > 2) {
      // TODO: Figure out what this magic number should really be!
      if(jj > 20) {
        remapped[i].manyTransitions = true
      }
      else {
        remapped[i].severalTransitions = true
      }

      remapped[i].characters = {}

      for(j=0; j<jj; j+=2) {
        chr = transitions[j]
        state = stateMap[transitions[j+1]]

        remapped[i].characters[chr] = {
          charCode: chr.charCodeAt(0)
        , chr: chr
        , targetState: state
        , initialState: def.initial
        , initialStateIsAccepted: initialStateIsAccepted
        }
      }
    }
    else if(jj === 2) {
      chr = transitions[0]
      state = stateMap[transitions[1]]
      remapped[i].oneTransition = true
      remapped[i].chr = chr
      remapped[i].charCode = chr.charCodeAt(0)
      remapped[i].targetState = state
    }
    else {
      remapped[i].noTransitions = true
    }
  }

  return {
    initialState: def.initial
  , initialStateIsAccepted: initialStateIsAccepted
  , transitions: remapped
  , stateMap: stateMap
  , inverseStateMap: inverseStateMap
  , acceptStates: '[' + def.accept.join(',') + ']'
  }
}

module.exports = context
