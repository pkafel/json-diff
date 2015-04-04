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