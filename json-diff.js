//// GLOBAL CONSTANTS

// OPS
ADD = "ADD";
NONE = "NONE";
REMOVE = "REMOVE";

// TYPES
ARRAY = "ARRAY";
OBJECT = "OBJECT";
SCALAR = "SCALAR";

//// OBJECTS
function Diff(key, value, op, valueType) {
  this.key = key;
  this.value = value;
  this.op = op;
  this.valueType = valueType;
}

function TopDiff(type, diff) {
  this.type = type;
  this.diff = diff;
}

//// MAIN FUNCTION
function getDiffRepresentation(left, right) {

  function _getType(v) {
    var type = typeof(v);
    if (type === 'number' || type === 'string' || type === 'boolean') return SCALAR;
    if (type === 'object') {
      if (v.constructor === Array) return ARRAY;
      else return OBJECT;
    }
  }

  function _getDiffValue(json, op) {
    var type = _getType(json);
    if(type === SCALAR) return json;
    else {
      function JsonInfo(json) {
        if(json instanceof Array) {
          this.numberOfElements = json.length;
          this.getValueForIndex = function(index) { return json[index]; }
          this.getKeyIfJson = function(index) { return null; }
        } else {
          this.keys = Object.keys(json);
          this.numberOfElements = this.keys.length;
          this.getValueForIndex = function(index) { return json[this.keys[index]]; }
          this.getKeyIfJson = function(index) { return this.keys[index]; }
        }
      }

      var result = [];
      var jsonInfo = new JsonInfo(json);
      for (var i = 0; i < jsonInfo.numberOfElements; i++) {
        var o = jsonInfo.getValueForIndex(i);
        var elementType = _getType(o);
        var diff = elementType === SCALAR ? o : _getDiffValue(o, op);
        result.push(new Diff(jsonInfo.getKeyIfJson(i), diff, op, elementType))
      }
      return result;
    }
  }

  function _getScalarsDiff(leftKey, leftValue, rightKey, rightValue) {
    var result = [];
    if(leftValue !== rightValue) {
      result.push(new Diff(leftKey, leftValue, ADD, SCALAR), new Diff(rightKey, rightValue, REMOVE, SCALAR));
    } else {
      result.push(new Diff(leftKey, leftValue, NONE, SCALAR));
    }
    return result;
  }

  function _getArraysDiff(left, right) {
    var result = [];
    var minLength = Math.min(left.length, right.length);
    for(var i = 0;i < minLength;i++) {
      var leftType = _getType(left[i]);
      var rightType = _getType(right[i]);
      if(leftType === rightType) {
        if(leftType === SCALAR) {
          result = result.concat(_getScalarsDiff(null, left[i], null,  right[i]));
        } else if(leftType === OBJECT) {
          result.push(new Diff(null, _getJsonsDiff(left[i], right[i]), NONE, OBJECT));
        } else {
          result.push(new Diff(null, _getArraysDiff(left[i], right[i]), NONE, ARRAY));
        }
      } else {
        result.push(new Diff(null, _getDiffValue(left[i], ADD), ADD, leftType));
        result.push(new Diff(null, _getDiffValue(right[i], REMOVE), REMOVE, rightType));
      }
    }

    var excessArrayInfo = left.length < right.length ? {"array":right, "operation":REMOVE} : {"array":left, "operation":ADD};
    for(var i = minLength;i < excessArrayInfo["array"].length ;i++) {
      var val = excessArrayInfo["array"][i];
      var op = excessArrayInfo["operation"];
      result.push(new Diff(null, _getDiffValue(val, op), op, _getType(val)));
    }

    return result;
  }

  function _getJsonsDiff(left, right) {
    var result = [];

    for(var key in left) {
      if(!right.hasOwnProperty(key)) result.push(new Diff(key, _getDiffValue(left[key], ADD), ADD, _getType(left[key])));
      else {
        var leftType = _getType(left[key]);
        var rightType = _getType(right[key]);
        if(leftType === rightType) {
          if (leftType === SCALAR) {
            result = result.concat(_getScalarsDiff(key, left[key], key,  right[key]));
          } else if (leftType === OBJECT) {
            result.push(new Diff(key, _getJsonsDiff(left[key], right[key]), NONE, OBJECT));
          } else {
            result.push(new Diff(key, _getArraysDiff(left[key], right[key]), NONE, ARRAY));
          }
        } else {
          result.push(new Diff(key, _getDiffValue(left[key], ADD), ADD, leftType));
          result.push(new Diff(key, _getDiffValue(right[key], REMOVE), REMOVE, rightType));
        }
      }
    }

    for(var key in right) {
      if(!left.hasOwnProperty(key)) {
        result.push(new Diff(key, _getDiffValue(right[key], REMOVE), REMOVE, _getType(right[key])));
      }
    }

    result.sort(function(a,b) {return (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0);} );
    return result;
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);

  if(leftJson instanceof Array && rightJson instanceof Array) return new TopDiff(ARRAY, _getArraysDiff(leftJson, rightJson));
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return new TopDiff(OBJECT, _getJsonsDiff(leftJson, rightJson));
  else throw "Nothing in common !";
}
