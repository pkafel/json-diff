describe("Json diff", function() {

  it("Two empty arrays should be equal", function() {
    expect(areJsonsEqual("[]", "[]")).toBe(true);
  });

  it("Two empty JSON objects should be equal", function() {
    expect(areJsonsEqual("{}", "{}")).toBe(true);
  });

  it("Array and Json objest should not be equal", function() {
    expect(areJsonsEqual("[]", "{}")).toBe(false);
  });
  
  it("Two arrays with the same elements but in different order should not be equal ", function() {
    expect(areJsonsEqual("[1,2,3]", "[1,3,2]")).toBe(false);
  });
  
  it("Two arrays with the same elements in the same order should be equal", function() {
    expect(areJsonsEqual("[3,1,2]", "[3,1,2]")).toBe(true);
  });
});
