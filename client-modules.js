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

  // function helpers
  var with_js = name => name + (name.substr(-3) == '.js' ? '' : '.js'),
      without_js = name => name.substr(-3) == '.js'
                         ? name.substr(0, name.length - 3)
                         : name,
      without_basedir = url => {
        if (is_beggining_with(url, main.dirname)) {
          return url.substr(main.dirname.length + 1);
        }
      },
      is_beggining_with = (full, start) => (full.substr(0, start.length) == start);

  class Module {
    constructor(filename) {
      this.loaded = false;

      this.filename = filename;
      this.dirname = join(filename, filename.substr(-1) == '/' ? '.' : '..');

      this.children = [];
      this.prepare = imports => null,
      this.exports = {};
    }

    addChildren(module) {
      this.children.push(module);
      module.parent = this;
    }

    require(requirement) {
      if (Array.isArray(requirement)) {
        return Promise.all(requirement.map(fn));
      } else if (typeof requirement === 'string') {
        var name = names;
        var url = join(this.dirname, with_js(name));
        var identifier = without_js(without_basedir(url));
        var module = modules[identifier];

        return new Promise(function(resolve, reject){
          if (module) {
            if(module.loaded) {
              resolve(module.exports);
            } else {
              $(module).on('loaded', (e) => resolve(module.exports));
            }
          } else {
            module = modules[identifier] = new Module(url);
            this.addChildren(module);
            // fetching module definition
            $.ajax(url, ajaxOpts).fail(reject)
            .done(response => {
              // execute module definition
              new Function('module', response)(module);
              // getting module requirement
              module.require(module.requirement).catch(reject)
              .then(imports => {
                // prepare after requirement resolved
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
        return new Promise((resolve, reject) => {resolve(requirement)});
      }
    }
  }

  var main = new Module(window.location.pathname),
    ajaxOpts = { cache: false, dataType: 'text' },
    modules = {};

  // require function
  fn = main.require.bind(main);
  fn.modules = modules;
  fn.main = main;
  fn.basedir = newBasedir => {
    if (typeof newBasedir == 'string') {
      main.dirname = join('/', newBasedir);
      main.children = [];
      fn.modules = modules = {};
    };
    return main.dirname;
  };
  return fn;
}({

}));
