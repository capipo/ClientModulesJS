module.requirement = ['module2', 'module3']

module.prepare = function(imports) {
  this.exports.fnB = () => {
    console.log('executed fnB() in module1 defined when prepare');
  };
  var module2 = imports[0];
  var module3 = imports[1];
  module2.fnB('from prepare() in module1');
  module3.fnB('from prepare() in module1');
}

module.exports.fnA = () => {
  console.log('executed fnA() in module1');
}

console.log('executed free script statements');