/*
Copyright (c) 2013 Daniel Mircea

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Perseverance = {

    save: function(key, object, filter) {
        var i = 0,
            data = [];

        localStorage[key] = JSON.stringify(object, function(k, value) {
            if(filter) value = filter(value);
            if(typeof(value) == "object" && !(value instanceof Array)) {
                if(value.__klass__) { // Recursion
                    return { $reference: value.__reference__ };
                } else {
                    value.__reference__ = "r" + String(++i); // Set an identifier (keys can't be numbers, including typecasted strings)
                    value.__klass__ = Perseverance.getClassName(value);
                }
                data.push(value);
            }
            return value;
        });
        // Clean objects
        for(var j in data) {
            delete data[j].__klass__;
            delete data[j].__reference__;
            delete data[j].$reference;
        }
    },

    read: function(key) {
        if(localStorage[key]) {
            var values = {},
                references = [];
            var data = JSON.parse(localStorage[key], function(k, value) {
                if(value && typeof(value) == "object") {
                    if(value.__klass__) {
                        value.__proto__ = window[value.__klass__].prototype;
                        values[value.__reference__] = value;
                        delete value.__klass__;
                        delete value.__reference__;
                    }
                    for(var i in value) {
                        if(value[i] && value[i].$reference) {
                            // Because objects are passed by reference rather than value,
                            // let's leverage this by storing the parent and the attribute that matches
                            // our circular reference
                            references.push({
                                parent: value,
                                attribute: i,
                                reference: value[i].$reference
                            });
                        }
                    }
                }
                return value;
            });
            for(var i in references) {
                // Replace the circular reference in the parent so all objects are modified
                references[i].parent[references[i].attribute] = values[references[i].reference];
            }
            return data;
        } else {
            return false;
        }
    },

    delete: function(key) {
        localStorage.removeItem(key);
    },

    getClassName: function(object) {
        if (object && object.constructor && object.constructor.toString) {
            var result = object.constructor.toString().match(/^function\s+(\w+)/);
            if(result && result.length > 1) {
                return result[1];
            }
        }
        return undefined;
    }

};
