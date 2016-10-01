var require = (function() {
  // function join copied from creationix/path.js
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
      this.dirname = join(url, url.substr(-1) == '/' ? '.' : '..');

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
  modules.main = new Module(window.location.pathname);

  // function to append .js to name  if necessary
  var with_js = name => name + (name.substr(-3) == '.js' ? '' : '.js');

  // require function
  var fn = function(names) {
    if (Array.isArray(names)) {
      return Promise.all(names.map(fn));
    } else if (typeof names === 'string') {
      var name = names;
      var parent = this instanceof Module ? this : modules.main ;
      var url = join(parent.dirname, with_js(name));
      var module = modules[url];
      var ajaxOpts = { cache: false, dataType: 'text' };

      return new Promise(function(resolve, reject){
        if (module) {
          if(module.loaded) {
            resolve(module.exports);
          } else {
            $(module).on('loaded', (e) => resolve(module.exports));
          }
        } else {
          module = modules[url] = new Module(url);
          parent.addChildren(module);
          // fetching module definition
          $.ajax(url, ajaxOpts).fail(reject)
          .done(response => {
            // execute module definition
            new Function('module', response)(module);
            // getting module require
            fn.bind(module)(module.require).catch(reject)
            .then(imports => {
              // prepare after require resolved
              module.prepare(imports);
              delete module.prepare;
              // finalize and resolve
              module.loaded = true;
              $(module).trigger('loaded');
              resolve(module.exports);
            })
          });
        }
      });
    } else {
      return new Promise((resolve, reject) => {resolve(names)});
    }
  }
  fn.modules = modules;
  return fn;
}({

}));
