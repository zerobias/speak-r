const R = require('ramda')
var ex = "marked handler defObj :: if <== is Array <- [^] <| propOr @defObj 'value' assoc 'mark' @marked ] <- handler 'notList'"


function listMark(marked, handler, defObj) {
  return function(data) {
    var result
    if (R.is(Array,data)) {
      result = data.map(function(e){
        var prop = e.value || defObj
        prop.mark = marked
        return prop
      })
    } else {
      result = handler('notList',data)
    }
    return result
  }
}