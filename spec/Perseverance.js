function MyObject(value) {
    this.attr = value;
};

describe("Perseverance", function() {

    beforeEach(function() {
        localStorage.clear();
    });

    describe("Saving", function() {
        it("serializes data into localStorage", function() {
            Perseverance.save("say", { hello: "world" });
            expect(localStorage["say"]).toEqual('{"hello":"world","__reference__":"r1","__klass__":"Object"}');
        });

        it("serializes circular dependencies", function() {
            var a = new MyObject();
            var b = new MyObject();
            a.b = a;
            expect(function() {
                Perseverance.save("circular", a);
            }).not.toThrow();
        });

        it("filters data through a callback", function() {
            Perseverance.save("say", { hello: "world" }, function(object) {
                return object == "world" ? "everyone" : object;
            });
            expect(localStorage["say"]).toEqual('{"hello":"everyone","__reference__":"r1","__klass__":"Object"}');
        });
    });

    describe("Retrieving", function() {
        it("deserializes data from localStorage", function() {
            localStorage["say"] = '{"hello":"world"}';
            expect(Perseverance.read("say")).toEqual({ hello: "world" });
        });

        it("restores object prototypes", function() {
            var greeting = new MyObject("hello world");
            Perseverance.save("say", greeting);
            greeting = Perseverance.read("say");
            expect(greeting instanceof(MyObject)).toBeTruthy();
            expect(greeting.attr).toEqual("hello world");
        });

        it("restores nested objects", function() {
            var greeting = new MyObject(new MyObject("Nested hello world"));
            Perseverance.save("say", greeting);
            greeting = Perseverance.read("say");
            expect(greeting.attr.attr).toEqual("Nested hello world");
        });

        it("restores circular dependencies", function() {
            var a = new MyObject();
            var b = new MyObject();
            a.b = a;
            Perseverance.save("circular", a);
            var circular = Perseverance.read("circular");
            expect(circular.b).toEqual(circular);
        });
    });

    describe("Deleting", function() {
        it("removes key value from localStorage", function() {
            Perseverance.save("say", { hello: "world" });
            Perseverance.delete("say");
            expect(localStorage["say"]).toBeFalsy();
        });

        it("doesn't affect other stored values", function() {
            Perseverance.save("say", { hello: "world" });
            Perseverance.save("whisper", { goodbye: "world" });
            Perseverance.delete("say");
            expect(localStorage["whisper"]).toEqual('{"goodbye":"world","__reference__":"r1","__klass__":"Object"}');
        });
    });

});
