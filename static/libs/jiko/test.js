
(function() {
"use strict";

if (typeof(module) !== "undefined") {
    global.assert = require("assert");
    global._ = require("underscore");
    global.jiko = require("./jiko");
}

var trim = function(t) {
    return t.replace(/^\s+|\s+$/g, '');
};

var transform = function(x) {
    return _.filter(_.map(x.split(/\s+/), function(el) { return trim(el); }),
        function(el) { return el; }).join(" ");
};

var templates = jiko.loadFile("templates.html");

test("base", function() {
    var r = templates.yop();
    assert.equal(trim(r), "Hello");
    r = templates.test({testVar: "azerty"});
    assert.equal(trim(r), "azerty");
    r = templates.test2({lst: [1, 2, 3]});
    r = transform(r);
    assert.equal(r, "1 2 3");
    r = templates.test3({lst: [2, 3, 4]});
    r = transform(r);
    assert.equal(r, "2 3 4");
    r = templates.testfct();
    assert.equal(transform(r), "abc def");

});

test("escaping", function() {
    var r = templates.testescaping();
    assert.equal(trim(r), "&lt;div&gt;&lt;&#x2F;div&gt;");
});

test("noescaping", function() {
    var r = templates.testnoescaping();
    assert.equal(trim(r), "<div></div>");
});

test("this", function() {
    var obj = {str: "test"};
    var r = templates.testThis.call(obj);
    assert.equal(trim(r), obj.str);
});

test("slash_escape", function() {
    var tmpl = jiko.loadTemplate("\\${1+1}");
    assert.equal(tmpl(), "${1+1}");
    tmpl = jiko.loadTemplate("\\\\${1+1}");
    assert.equal(tmpl(), "\\2");
    tmpl = jiko.loadTemplate("\\\\\\${1+1}");
    assert.equal(tmpl(), "\\${1+1}");
    tmpl = jiko.loadTemplate("\\\\\\\\${1+1}");
    assert.equal(tmpl(), "\\\\2");
    tmpl = jiko.loadTemplate("\\\\\\\\\\${1+1}");
    assert.equal(tmpl(), "\\\\${1+1}");
    tmpl = jiko.loadTemplate("\\${1+1}\n${1+1}");
    assert.equal(tmpl(), "${1+1}\n2");
    tmpl = jiko.loadTemplate("\\\\${1+1}\n${1+1}");
    assert.equal(tmpl(), "\\2\n2");
});

test("def", function() {
    var r = templates.testDef();
    assert.equal(trim(r), "Test");
});

test("functional_prog", function() {
    var r = templates.testFunctional();
    assert.equal(transform(r), "<div> Test </div>");
});

test("comment", function() {
    var r = templates.testComment();
    assert.equal(transform(r), "Test");
});

test("multiComment", function() {
    var r = templates.testMultiComment();
    assert.equal(transform(r), "Test");
});

test("print", function() {
    var r = templates.printtest();
    assert.equal(transform(r), "Test");
});

test("singleLineEventSlashEscape", function() {
    var r = jiko.evaluate("\n\\%print(1+1)");
    assert.equal(r, "\n%print(1+1)");
    r = jiko.evaluate("\n\\\\%print(1+1)");
    assert.equal(r, "\n\\2");
});

test("keepUsefulWhitespaces", function() {
    var r = jiko.evaluate("Foo ${bar}", {bar:"Bar"});
    assert.equal(r, "Foo Bar");
    r = jiko.evaluate("${bar} Foo", {bar:"Bar"});
    assert.equal(r, "Bar Foo");
    r = jiko.evaluate("Foo\n%if(true===true){\nBar\n%}");
    assert.equal(transform(r), "Foo Bar");
});

test("doesNotAddSpaces", function() {
    var r = jiko.evaluate("Foo${bar}", {bar:"Bar"});
    assert.equal(r, "FooBar");
    r = jiko.evaluate("${bar}Foo", {bar:"Bar"});
    assert.equal(r, "BarFoo");
});

test("singleLinePreviousSpace", function() {
    var r = templates.singleLinePreviousSpace();
    assert.equal(transform(r), "abc def");
});

test("multiSingleLine", function() {
    var r = templates.multiSingleLine();
    assert.equal(transform(r), "Test");
    r = jiko.evaluate("\n\n%if (true === true) {\nTest\n%}\n\n");
    assert.equal(transform(r), "Test");
});

})();
