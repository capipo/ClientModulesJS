Modules = {modules: {}};
Modules.resolveDirname = filename => filename.split('?')[0].split('/').slice(0,-1).join('/') + '/';
Modules.dirname = Modules.resolveDirname(window.location.href)
Modules.require = function(...names) {
    if (names.length == 0) {
      return new Promise((resolve, reject) => {resolve()});
    }
    var parent = this;
    var getOne = (name) => {
      var url = `${parent.dirname}${name}.js`;
      return new Promise(function(resolve, reject){
        var module = Modules.modules[url];
        if (module) {
          resolve(module.exports);
        } else {
          module = Modules.modules[url] = {
            loaded: false,
            filename: url,
            dirname: Modules.resolveDirname(url),
            require: [],
            prepare: imports => null,
            exports: {},
          };

          $.ajax(url, {
            cache: false,
            dataType: 'text',
          }).done(response => {
            new Function('module', response)(module);
            Modules.require.apply(module, module.require)
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