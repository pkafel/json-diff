# Json diff library
Pure Javascript library for comparing two Jsons. As an output returns well define structure so you can always use it to present JSON diff in whatever way you like.

## How to run unit tests
It is super simple ! Just open `test/SpecRunner.html.jst` in your browser !

## How does output look like
The output of `getDiffRepresentation` is a tree. The root of the tree is represented in the following way:
```
{
  "type": < "OBJECT" | "ARRAY" >,
  "diff": [ nodes ]
}
```

Nodes representation: 
```
{
  "key": ...,
  "value": < scalar value | [ nodes ] >,
  "valueType": < "SCALAR" | "OBJECT" | "ARRAY">,
  "op": < "ADD" | "REMOVE" | "NONE">
}
```
