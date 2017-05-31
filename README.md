# ClientModulesJS

A JavaScript library for loading modules on client-side ala Node.js, using
Promises to load them asynchronously.

## Content
* [Dependencies](#dependencies)
* [Install](#install)
* [Modules](#modules)
 * [Modules definition](#modules-define)
 * [Requiring](#modules-require)

<a name="dependencies"></a>
## Dependencies

  * [jQuery](https://jquery.com/)

<a name="install"></a>
## Install

Import `client-modules.js` file in your HTML file.

```html
<!-- You have to import jQuery before importing client-modules -->
<script type="text/javascript" src="/path/to/client-modules.js"></script>
```

<a name="modules"></a>
## Modules

ClientModulesJS
is inspired in Node.js modules system
(if you're unfamiliar with Node.js modules
[reading this](https://nodejs.org/api/modules.html)
could help you understand this document).
Node.js modules load synchronously, which wouldn't
work well for front-end. That's why we use promises.

<a name="modules-define"></a>
### Modules definition

You can use `module.exports` to define the module you want
to export (just like Node.js).

```js
// module.js
module.exports.someFunction = function() {
  // do something
};
module.export.someObject = {
  // some object properties
};
```

Use `requirement` to specify dependencies and `prepare` to define exports
after the required dependencies are available.

```js
//module.js

// Name of the module required by this module
module.requirement = 'module2';

// it is possible to require more than one, e.g.:
// module.requirement = ['module2', 'module3'];
// module.requirement = { two: 'module2', three: 'module3' };

// This function will be executed after all dependencies specified in
// module.requirement resolve, with the exports object as argument.
module.prepare = function(imports) {
  module.exports.dependent = {
    // You can now use the imported modules to define this export.
  };
};
```

<a name="modules-require"></a>
### Requiring modules

Use `require` function to import modules.
```js
require('modules/module')
  .then(function(imports) {
    // imports is the exports object of the required module.
    // Now we can use the imported module.
  })
  .catch(function(error) {
    // do something with the error
  });
```

If you need to import more than one module you can pass an array to the
`require` function.

```js
require(['modules/module1', 'modules/module2', 'modules/module3'])
  .then(function(imports) {
    // Here imports is an array of the require modules exports objects
    var module1 = imports[0],
        module2 = imports[1],
        module2 = imports[2];
  })
```

You could also pass an object.

```js
var requeriment = {
  one: 'modules/module1',
  two: 'modules/module2',
  three: 'modules/module3'
};
require(requeriment)
  .then(function(imports) {
    // imports is an object with the same structure as the requirement
    // object containing the corresponding exports objects.
    // e.g.:
    //      imports = {
    //        one: module1_exports,
    //        two: module2_exports,
    //        three: module3_exports
    //      }
  })
```
