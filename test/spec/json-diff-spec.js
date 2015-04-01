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
});
