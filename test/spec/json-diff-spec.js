describe("Get Json diff representation", function() {

  it("For two arrays with different value should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[4,5]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("REPLACE");
    expect(result[0].oldValue).toEqual(4);
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("REPLACE");
    expect(result[1].oldValue).toEqual(5);
  });

  it("For two arrays with the same values should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[1,2]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("NONE");
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("NONE");
  });

  it("For two the same flat JSONs should return object without any differences", function() {
    var result = getDiffRepresentation("{\"key1\": 123, \"key2\": \"some value\"}", "{\"key2\": \"some value\", \"key1\": 123}");
    expect(result["key1"].value).toEqual(123);
    expect(result["key1"].diffType).toEqual("NONE");
    expect(result["key2"].value).toEqual("some value");
    expect(result["key2"].diffType).toEqual("NONE");
  });
  
  it("For two arrays with flat JSONs on it should return correct diff", function() {
    var result = getDiffRepresentation("[1,2,{\"key1\": 234, \"key2\": \"val\"}]",
				       "[3,2,{\"key2\": 234, \"key3\": \"val\"}]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("REPLACE");
    expect(result[0].oldValue).toEqual(3);
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("NONE");
    expect(result[2].value["key1"].value).toEqual(234);
    expect(result[2].value["key1"].diffType).toEqual("ADD");
    expect(result[2].value["key2"].value).toEqual("val");
    expect(result[2].value["key2"].diffType).toEqual("REPLACE");
    expect(result[2].value["key2"].oldValue).toEqual(234);
    expect(result[2].value["key3"].value).toEqual("val");
    expect(result[2].value["key3"].diffType).toEqual("REMOVE");
  });

  it("Array of arrays and empty flat array should be different", function() {
    var result = getDiffRepresentation("[]", "[[],[]]");
    expect(result).toEqual(jasmine.any(Array));
    expect(result[0]["diffType"]).toBe("REMOVE");
    expect(result[0]["value"]).toEqual(jasmine.any(Array));
    expect(result[0]["value"].length).toEqual(0);
    expect(result[1]["diffType"]).toBe("REMOVE");
    expect(result[1]["value"]).toEqual(jasmine.any(Array));
    expect(result[1]["value"].length).toEqual(0);
  });

  it("Array and JSON object have nothing in common so should throw exception", function() {
    var call = function() {
      return getDiffRepresentation("[]", "{}");
    };
    expect(call).toThrow();
  });

  it("Two similar with small difference hidden in depth should be different", function() {
    var result = getDiffRepresentation("{\"a\":{\"b\":{\"c\":\"d\"}}}", "{\"a\":{\"b\":{\"c\":\"e\"}}}");

    expect(result["a"]["diffType"]).toBe("NONE");
    expect(result["a"]["value"]["b"]["diffType"]).toBe("NONE");
    expect(result["a"]["value"]["b"]["value"]["c"]["diffType"]).toBe("REPLACE");
    expect(result["a"]["value"]["b"]["value"]["c"]["value"]).toBe("d");
    expect(result["a"]["value"]["b"]["value"]["c"]["oldValue"]).toBe("e");
  });
});
