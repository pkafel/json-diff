function areJsonsEqual(left, right) {
  var leftJson = JSON.parse(left);
  var rightJson = JSON.parse(right);
  // can only be arrays or objects
  if(leftJson instanceof Array && rightJson instanceof Array) return leftJson.length === rightJson.length;
  else if(!(leftJson instanceof Array) && !(rightJson instanceof Array)) return Object.keys(leftJson).length === Object.keys(rightJson).length;
  else return false;
}