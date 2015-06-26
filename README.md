# Json diff library
Pure Javascript library for comparing two Jsons. As an output returns well define structure so you can always use it to present JSON diff in whatever way you like.

## How to run unit tests
It is super simple ! Just open `test/SpecRunner.html.jst` in your browser !

## Output structure
The output of `getDiffRepresentation` is a tree. The root of the tree is represented in the following way:
```
{
  "type": < "OBJECT" | "ARRAY" | "NULL" >,
  "diff": [ nodes ]
}
```

Nodes representation: 
```
{
  "key": ...,
  "value": < scalar value | [ nodes ] >,
  "valueType": < "SCALAR" | "OBJECT" | "ARRAY" | "NULL" >,
  "op": < "ADD" | "REMOVE" | "NONE" >
}
```

## Examples
If you are interested in some examples you can find them [here](https://github.com/pkafel/json-diff/wiki/Examples) !
