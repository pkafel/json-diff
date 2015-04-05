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

  function getArraysDiff(left, right) {
    var result = [];
    for(var i = 0;i < left.length;i++) {
      if(left[i] !== right[i]) {
	result.push(createDiffEntry(left[i], "ADD"));
	result.push(createDiffEntry(right[i], "REMOVE"));
      } else {
	result.push(createDiffEntry(left[i], "NONE"));
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
      else if(left[key] !== right[key]) result[key] = createReplaceEntry(left[key], right[key]);
      else result[key] = createDiffEntry(left[key], "NONE");
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
  else throw "Functionality not yet implemented !";
}
