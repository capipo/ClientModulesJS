Modules.modules = {};
Modules.require = (...names) => {
  if (names.length == 0) {
    return new Promise((resolve, reject) => {resolve()});
  }
  function getOne(name) {
    var parent = this;
    var url = `/${name}.js`;
    return new Promise(function(resolve, reject){
      var module = Modules.modules[url];
      if (module) {
        resolve(module.exports);
      } else {
        module = Modules.modules[url] = {
          loaded: false,
          filename: url,
          dirname: url.split('/').slice(0,-1).join('/') + '/',
          require: [],
          prepare: function () {},
        };
        $.ajax(url, { data: {etag: etag}, dataType: 'text'})
        .done(function (response) {
            new Function('module', response)(module);
            if (module.require.length) {
              require.apply(module, module.require)
                .then(function(imports) {
                  module.imports = imports;
                  module.prepare(imports);
                  module.loaded = true;
                  resolve(module.exports);
                });
            } else {
              module.prepare();
              module.loaded = true;
              resolve(module.exports);
            }
        })
        .fail(function (jqXHR) {
            handleErrorResponse(jqXHR);
            reject(jqXHR);
        });
      }
    });
  };
  return new Promise(function(resolve, reject) {
    Promise.all(_.map(names, getOne))
    .then(function(imports) {
      resolve(imports);
    });
  });
}