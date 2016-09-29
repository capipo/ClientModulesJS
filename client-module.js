var require = (function() {
  class Module {
    constructor(url) {
      this.loaded = false;

      this.filename = url;
      this.dirname = url.split('?')[0].split('/').slice(0,-1).join('/') + '/';

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

  var modules = {};
  modules.main = new Module(window.location.href)

  var fn = function(...names) {
    if (names.length == 0) {
      return new Promise((resolve, reject) => {resolve()});
    }
    var getOne = (name) => {
      var parent = this instanceof Module ? this : modules.main ;
      var url = `${parent.dirname}${name}.js`;
      return new Promise(function(resolve, reject){
        var module = modules[url];
        if (module) {
          resolve(module.exports);
        } else {
          module = modules[url] = new Module(url);
          parent.addChildren(module);
          $.ajax(url, {
            cache: false,
            dataType: 'text',
          }).done(response => {
            new Function('module', response)(module);
            fn.apply(module, module.require)
            .then(function(imports) {
                module.imports = imports;
                module.prepare(imports);
                module.loaded = true;
                resolve(module.exports);
            });
          }).fail(reject);

        }
      });
    };
    return new Promise(function(resolve, reject) {
      Promise.all(names.map(getOne))
      .then(function(imports) {
        resolve(imports);
      });
    });
  }
  return fn;
}({

}));
