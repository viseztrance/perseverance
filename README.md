# Perseverance

This library allows javascript objects to be saved for later use, such as between page requests or closing and opening the browser.

## Installation

Copy and require `lib/perseverance.js` into your application.

## Usage

__Saving__ can be done by using the following:
```javascript
Perseverance.save("item", myItem);
```

Your object can contain references to other objects, including itself, and that's ok. For instance the following should work fine:
```javascript
var obj = new MyObject();
obj.someAttr = obj;
Perseverance.save("circular", obj);
```

There are cases however, when you may want to filter out certain elements from being saved. You may do so through a callback:
```javascript
Perseverance.save("item", myItem, function(object) {
    if(typeof(object) == "object") {
        var klassName = Perseverance.getClassName(object);
        // Avoid serializing third party objects
        if(!klassName || klassName.match(/svg/i)) return false;
    }
    return object;
});
```

__Loading__ the object is pretty straightforward:
```javascript
var myItem = Perseverance.read("item");
```

__Removing__ is as easy as:

```javascript
Perseverance.delete("item");
```

## Additional notes

The data is serialized as JSON into `localStorage` and rebuilt using the `__proto__` attribute. __It does not work in Internet Explorer__. However since this attribute has been standardized in EcmaScript 6, IE11 should run ok.

## License

This package is licensed under the MIT license and/or the Creative Commons Attribution-ShareAlike.
