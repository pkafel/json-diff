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

  function _getInDepthDiff(json, op) {
    var type = _getType(json);
    if(type === OBJECT) return _getInDepthJsonDiff(json, op);
    else if(type === ARRAY) return _getInDepthArrayDiff(json, op);
    else return json;
  }

  function _getInDepthArrayDiff(json, op) {
    var result = [];
    for(var i = 0;i < json.length;i++) {
      var value = json[i];
      var valueType = _getType(value);
      if (valueType === SCALAR) {
        result.push(new Diff(null, value, op, SCALAR));
      } else if (valueType === OBJECT) {
        result.push(new Diff(null, _getInDepthJsonDiff(value, op), op, OBJECT));
      } else {
        result.push(new Diff(null, _getInDepthArrayDiff(value, op), op, ARRAY));
      }
    }
    return result;
  }

  function _getInDepthJsonDiff(json, op) {
    var result = [];

    for(var key in json) {
      var value = json[key];
      var valueType = _getType(value);
      if (valueType === SCALAR) {
        result.push(new Diff(key, value, op, SCALAR));
      } else if (valueType === OBJECT) {
        result.push(new Diff(key, _getInDepthJsonDiff(value, op), op, OBJECT));
      } else {
        result.push(new Diff(key, _getInDepthArrayDiff(value, op), op, ARRAY));
      }
    }
    result.sort(_sortByKeyAndOp);
    return result;
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
        result.push(new Diff(null, _getInDepthDiff(left[i], ADD), ADD, leftType));
        result.push(new Diff(null, _getInDepthDiff(right[i], REMOVE), REMOVE, rightType));
      }
    }

    var excessArrayInfo = left.length < right.length ? {"array":right, "operation":REMOVE} : {"array":left, "operation":ADD};
    for(var i = minLength;i < excessArrayInfo["array"].length ;i++) {
      var val = excessArrayInfo["array"][i];
      var op = excessArrayInfo["operation"];
      result.push(new Diff(null, _getInDepthDiff(val, op), op, _getType(val)));
    }

    return result;
  }

  function _getJsonsDiff(left, right) {
    var result = [];

    for(var key in left) {
      if(!right.hasOwnProperty(key)) result.push(new Diff(key, _getInDepthDiff(left[key], ADD), ADD, _getType(left[key])));
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
          result.push(new Diff(key, _getInDepthDiff(left[key], ADD), ADD, leftType));
          result.push(new Diff(key, _getInDepthDiff(right[key], REMOVE), REMOVE, rightType));
        }
      }
    }

    for(var key in right) {
      if(!left.hasOwnProperty(key)) {
        result.push(new Diff(key, _getInDepthDiff(right[key], REMOVE), REMOVE, _getType(right[key])));
      }
    }

    result.sort(_sortByKeyAndOp);
    return result;
  }

  function _sortByKeyAndOp(a, b){
    if (a.key === b.key) return (a.op === ADD) ? -1 : (a.op === REMOVE) ? 1 : 0;
    return a.key > b.key ? 1 : (b.key > a.key) ? -1 : 0;
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);

  if(leftJson instanceof Array && rightJson instanceof Array) return new TopDiff(ARRAY, _getArraysDiff(leftJson, rightJson));
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return new TopDiff(OBJECT, _getJsonsDiff(leftJson, rightJson));
  else throw "Nothing in common !";
}
