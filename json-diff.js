function areJsonsEqual(left, right) {

  function areArraysEqual(left, right) {
    if(left.length !== right.length) return false;

    for(var i = left.length; i--;) {
      if(left[i] !== right[i]) return false;
    }
    return true;
  }

  function areJsonObjectsEqual(left, right) {
    if(Object.keys(left).length !== Object.keys(right).length) return false;

    for(var key in left) {
      if(!right.hasOwnProperty(key) || left[key] !== right[key]) return false;
    }
    return true;
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);
  // can only be arrays or objects
  if(leftJson instanceof Array && rightJson instanceof Array) return areArraysEqual(leftJson, rightJson);
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return areJsonObjectsEqual(leftJson, rightJson);
  else return false;
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
    else return createDiffEntry(left, "NONE");
  }
  
  function getArraysDiff(left, right) {
    var result = [];
    for(var i = 0;i < left.length;i++) {
      var leftType = getType(left[i]);
      var rightType = getType(right[i]);
      if(leftType === rightType) {
	if(leftType === 'scalar') result.push(getScalarsDiff(left[i], right[i]));
	else if(leftType === 'object') result.push(getJsonsDiff(left[i], right[i]));
	else result.push(getArraysDiff(left[i], right[i]));
      } else {
	throw "Functionality not yet implemented !";// TODO two different types so nothing to look on.. scroll further...
      }
    }

    if(left.length < right.length) {
      for(var i = left.length;i < right.length ;i++) {
	result.push(createDiffEntry(right[i], "REMOVE"));
      }
    }

    return result;
  }

  function getJsonsDiff(left, right) {
    var result = {};

    for(var key in left) {
      if(!right.hasOwnProperty(key)) result[key] = createDiffEntry(left[key], "ADD");
      else {
	var leftType = getType(left[key]);
	var rightType = getType(right[key]);

	if(leftType === 'scalar') result[key] = getScalarsDiff(left[key], right[key]);
	else if(leftType === 'object') result[key] = getJsonsDiff(left[key], right[key]);
	else result[key] = getArraysDiff(left[key], right[key]);
      }
    }

    for(var key in right) {
      if(!result.hasOwnProperty(key)) result[key] = createDiffEntry(right[key], "REMOVE");
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
      "diffType": "REPLACE"
    };
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);

  if(leftJson instanceof Array && rightJson instanceof Array) return getArraysDiff(leftJson, rightJson);
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return getJsonsDiff(leftJson, rightJson);
  else throw "Functionality not yet implemented !"; // TODO need to handle that - nothing in common
}
