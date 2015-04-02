function areJsonsEqual(left, right) {

  function areArraysEqual(left, right) {
    if(left.length !== right.length) return false;

    for(var i = left.length; i--;) {
      if(left[i] !== right[i]) return false;
    }
    return true;
  }

  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);
  // can only be arrays or objects
  if(leftJson instanceof Array && rightJson instanceof Array) return areArraysEqual(left, right);
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return Object.keys(leftJson).length === Object.keys(rightJson).length;
  else return false;
}