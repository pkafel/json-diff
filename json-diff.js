// GLOBAL CONSTANTS

// OPS
var ADD = "ADD";
var NONE = "NONE";
var REMOVE = "REMOVE";
var REPLACE = "REPLACE";

// TYPES
var SCALAR = "SCALAR";
var ARRAY = "ARRAY";
var OBJECT = "OBJECT";

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

function getDiffRepresentation2(left, right) {

  function _getType(v) {
    var type = typeof(v);
    if (type === 'number' || type === 'string' || type === 'boolean') return SCALAR;
    if (type === 'object') {
      if (v.constructor === Array) return ARRAY;
      else return OBJECT;
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

        result.push(new Diff(null, left[i], ADD, leftType));
        result.push(new Diff(null, right[i], REMOVE, rightType));

      }
    }

    var excessArrayInfo = left.length < right.length ? {"array":right, "operation":REMOVE} : {"array":left, "operation":ADD};
    for(var i = minLength;i < excessArrayInfo["array"].length ;i++) {
      var val = excessArrayInfo["array"][i];
      result.push(new Diff(null, val, excessArrayInfo["operation"], _getType(val)));
    }

    return result;
  }

  function _getJsonsDiff(left, right) {
    var result = [];

    for(var key in left) {
      if(!right.hasOwnProperty(key)) result.push(new Diff(key, left[key], ADD, _getType(left[key])));
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
          result.push(new Diff(key, left[key], ADD, leftType));
          result.push(new Diff(key, right[key], REMOVE, rightType));
        }
      }
    }

    for(var key in right) {
      if(!left.hasOwnProperty(key)) {
        result.push(new Diff(key, right[key], REMOVE, _getType(right[key])));
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

function getDiffRepresentation(left, right) {
  
  function getType(v) {
    var type = typeof(v);
    if (type === 'number' || type === 'string' || type === 'boolean') return 'scalar';
    if (type === 'object') {
      if (v.constructor === Array) return 'array';
      else return 'object';
    }
  }
  
  function getScalarsDiff(left, right) {
    if(left !== right) return createReplaceEntry(left, right);
    else return createDiffEntry(left, NONE);
  }
  
  function getArraysDiff(left, right) {
    var result = [];
    var minLength = Math.min(left.length, right.length);
    for(var i = 0;i < minLength;i++) {
      var leftType = getType(left[i]);
      var rightType = getType(right[i]);
      if(leftType === rightType) {
        if(leftType === 'scalar') result.push(getScalarsDiff(left[i], right[i]));
        else if(leftType === 'object') result.push(createDiffEntry(getJsonsDiff(left[i], right[i]), NONE));
        else result.push(createDiffEntry(getArraysDiff(left[i], right[i]), NONE));
      } else {
        result.push(createReplaceEntry(left[i], right[i]));
      }
    }

    var excessArrayInfo = left.length < right.length ? {"array":right, "operation":REMOVE} : {"array":left, "operation":ADD};
    for(var i = minLength;i < excessArrayInfo["array"].length ;i++) {
      result.push(createDiffEntry(excessArrayInfo["array"][i], excessArrayInfo["operation"]));
    }

    return result;
  }

  function getJsonsDiff(left, right) {
    var result = {};

    for(var key in left) {
      if(!right.hasOwnProperty(key)) result[key] = createDiffEntry(left[key], ADD);
      else {
        var leftType = getType(left[key]);
        var rightType = getType(right[key]);
        if(leftType === rightType) {
          if (leftType === 'scalar') result[key] = getScalarsDiff(left[key], right[key]);
          else if (leftType === 'object') result[key] = createDiffEntry(getJsonsDiff(left[key], right[key]), NONE);
          else result[key] = createDiffEntry(getArraysDiff(left[key], right[key]), NONE);
        } else {
          result[key] = createReplaceEntry(left[key], right[key]);
        }
      }
    }

    for(var key in right) {
      if(!result.hasOwnProperty(key)) result[key] = createDiffEntry(right[key], REMOVE);
    }
    return result;
  }

  function createDiffEntry(val, diffType) {
    return {
      "value": val,
      "diffType": diffType
    };
  }

  function createReplaceEntry(val, oldVal) {
    return {
      "value": val,
      "oldValue": oldVal,
      "diffType": REPLACE
    };
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);

  if(leftJson instanceof Array && rightJson instanceof Array) return getArraysDiff(leftJson, rightJson);
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return getJsonsDiff(leftJson, rightJson);
  else throw "Nothing in common !";
}
