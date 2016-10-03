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

  // helpers
  var with_js = name => name + (name.substr(-3) == '.js' ? '' : '.js'),
      without_js = name => name.substr(-3) == '.js'
                         ? name.substr(0, name.length - 3)
                         : name,
      without_basedir = url => {
        if (is_beggining_with(url, main.dirname)) {
          return url.substr(main.dirname.length + 1);
        }
      },
      is_beggining_with = (full, start) => (full.substr(0, start.length) == start),
      to_arr = (o) => Object.keys(o).map(k => o[k] || k ),
      to_obj = (ks, vs) => ks.reduce((o,k,i)=> {o[k] = vs[i]; return o;}, {});

  // Module
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
      var that = this;
      if (Array.isArray(requirement)) {
        return Promise.all(requirement.map(this.require.bind(this)));
      } else if (typeof requirement === 'object') {
        return new Promise(function(resolve, reject) {
          var keys = Object.keys(requirement);
          that.require(to_arr(requirement))
            .then(imports => resolve(to_obj(keys, imports)))
            .catch(reject);
        });
      } else if (typeof requirement === 'string') {
        var url = that.resolve(with_js(requirement));
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
            that.addChildren(module);
            // fetching module definition
            $.ajax(url, ajaxOpts)
            .done(response => {
              // execute module definition
              new Function('exports', 'require', 'module', '__filename', '__dirname', response)
              (module.exports, publicProps(module.require), module, module.filename, module.dirname);
              // getting module requirement
              module.require(module.requirement)
              .then(imports => {
                // prepare after requirement resolved
                module.prepare(imports);
                delete module.prepare;
                // finalize and resolve
                module.loaded = true;
                $(module).trigger('loaded');
                resolve(module.exports);
              })
              .catch(reject);
            })
            .fail(reject);
          }
        });
      } else {
        return new Promise((resolve, reject) => {resolve(requirement)});
      }
    }

    resolve(name) {
      var base = main.dirname;
      if (name.substr(0, 1) === '/') {
        base = '/';
      } else if (name.substr(0, 2) === './' || name.substr(0, 3) === '../') {
        base = this.dirname;
      }
      return join(base, name);
    }
  }

  // core
  var main = new Module(window.location.pathname),
    ajaxOpts = { cache: false, dataType: 'text' },
    modules = {};

  function publicProps(fn) {
    fn.modules = modules;
    fn.main = main;
    fn.basedir = newBasedir => {
      if (typeof newBasedir == 'string') {
        main.dirname = main.resolve(newBasedir);
        main.children = [];
        fn.modules = modules = {};
      };
      return main.dirname;
    };
    return fn;
  }

  // require function
  return publicProps(main.require.bind(main));
}({

}));
