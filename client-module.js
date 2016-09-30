var require = (function() {
  // function copied from creationix/path.js
  function join(/* path segments */) {
    var parts = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
      parts = parts.concat(arguments[i].split("/"));
    }
    var newParts = [];
    for (i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];
      if (!part || part === ".") continue;
      if (part === "..") newParts.pop();
      else newParts.push(part);
    }
    if (parts[0] === "") newParts.unshift("");
    return newParts.join("/") || (newParts.length ? "/" : ".");
  }

  var modules = {};

  class Module {
    constructor(url) {
      this.loaded = false;

      this.filename = url;
      this.dirname = join(url, '..');

      this.children = [];
      this.require = [];
      this.prepare = imports => null,
      this.exports = {};
    }

    addChildren(module) {
      this.children.push(module);
      module.parent = this;
    }
  }

  modules.main = new Module(window.location.href.split('?')[0])
  modules.main.filename = null;

  var fn = function(names) {
    var getOne = (name) => {
      var parent = this instanceof Module ? this : modules.main ;
      var url = join(parent.dirname, name + '.js');
      return new Promise(function(resolve, reject){
        var module = modules[url];
        if (module) {
          resolve(module.exports);
        } else {
          module = modules[url] = new Module(url);
          parent.addChildren(module);
          $.ajax(url, { cache: false, dataType: 'text'
          }).done(response => {
            new Function('module', response)(module);
            fn.bind(module)(module.require)
            .then(function(imports) {
                module.prepare(imports);
                delete module.prepare;
                module.loaded = true;
                resolve(module.exports);
            });
          }).fail(reject);
        }
      });
    };

    if (Array.isArray(names)) {
      return Promise.all(names.map(getOne));
    } else if (typeof names === 'string') {
      return getOne(names);
    } else {
      return new Promise((resolve, reject) => {resolve(names)});
    }
  }
  fn.modules = modules;
  return fn;
}({

}));
