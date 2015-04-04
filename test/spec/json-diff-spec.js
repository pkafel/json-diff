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

  it("Two the same flat JSON objects should be equal", function() {
    expect(areJsonsEqual("{\"key1\": 12, \"key2\":\"some value\"}", "{\"key2\":\"some value\", \"key1\": 12}")).toBe(true);
  });

  it("Two flat JSON objects with different key should not be equal", function() {
    expect(areJsonsEqual("{\"key1\": 12}", "{\"key2\": 12}")).toBe(false);
  });

  it("Two flat JSON objects with different value should not be equal", function() {
    expect(areJsonsEqual("{\"key1\": 1234}", "{\"key1\": 12}")).toBe(false);
  });
});
