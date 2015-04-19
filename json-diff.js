function getDiffRepresentation(left, right) {

  // GLOBAL CONSTANTS
  var ADD = "ADD";
  var NONE = "NONE";
  var REMOVE = "REMOVE";
  var REPLACE = "REPLACE";
  
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
