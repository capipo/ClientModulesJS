# ClientModulesJS

Biblioteca de javascript para cargar módulos en el lado del cliente,
al estilo node.js, usando promesas para descargarlos de manera asíncrona.

Actualmente está recibiendo cambios constantes
algunas de las funcionalidades
podrían no funcionar como están descritas.

## Dependencias

  * [jQuery](https://jquery.com/)

## Instalación

Importe el archivo ``client-module.js`` en su página html.

```html
<!-- Previamente importar jQuery -->
<script type="text/javascript" src="/path/to/client-modules.js"></script>
```

## Configuración

Aún no hay opciones configurables...

## Módulos

ClientModule.JS
esta inspirado en el sistema de módulos de node.js
(si no está familiarizado con los modulos de node.js
[está lectura](https://nodejs.org/api/modules.html)
podría facilitar la comprensión de este documento).
Pero los módulos de node se cargan de manera síncrona,
un comportamiento similar en el lado del cliente
no sería bién visto por el usuario,
entonces necesitamos un sistema de módulos asíncrono
por eso utilizaremos promesas.

### Definir módulos

Cuando escribe un módulo puede usar, al igual que en node.js,
el objeto module.exports para definir
lo que el módulo exportará.

```js
// module.js
module.exports.someFunction = function() {
 // acciones de la función
}
module.export.someObject = {
  //contenido del objeto
}
```

Pero si lo que exportará el módelo depende de otros módelos
no podriamos usar simplemente require en la definición del módulo porque eso
ocacionaría la creación de una nueva promesa y la importación
del módulo actual pudiera darse por concluida antes de que el nuevo require sea
correctamente concluido,
finalmente tendriamos un resultado poco predecible.

Para resolver esté problema los módulos de ClientModule.JS tiene el atributo
requirement y prepare

```js
//module.js

// Nombre del Módulo requerido por esté módulo
module.requirement = 'module2';
// es posible requerir mas de uno, por ejemplo:
// module.requirement = ['module2', 'module3'];
// module.requirement = { two: 'module2', three: 'module3' };

// Esta función será ejecutada despues de resolver las dependencias
// especificadas en module.requeriments
// lo que haya sido importado será pasado como atributo de la función prepare
module.prepare = function(imports) {
  module.exports.dependent = {
    // Se puede usar lo que haya sido importado para definir esta función
  }
}
module.exports.independent = function() {
  // Si el elemento a exportar no depende de lo que se vaya a importar
  // puede definirse fuera de prepare o dentro si se desea...
}
```

### Importar módulos

Para importar un modulo use la función require como se indica
```js
require('modules/module')
  .then(function(imports) {
    // imports es el objeto exports del modulo requerido
    // ahora puede hacer lo que necesite con el objeto importado
  })
  .catch(function(error) {
    console.log('error!!!', error);
  });
```

Si necesita importar mas de un módulo puede pasar un arreglo con los nombres
de los módulos deseados.

```js
require(['modules/module1', 'modules/module2', 'modules/module3'])
  .then(function(imports) {
    // imports es un Array que contiene cada objeto exports de los modulos requeridos
    var module1 = imports[0],
        module2 = imports[1],
        module2 = imports[2];
  })
  .catch(function(error) {
    console.log('error!!!', error);
  });
```

Tambien puede pasar un objeto.

```js
var requeriment = {
  one: 'modules/module1',
  two: 'modules/module2',
  three: 'modules/module3'
};
require(requeriment)
  .then(function(imports) {
    //  imports es un objeto que tendrá la misma estructura que el objeto
    //  requirement solo que en lugar de los strings que representan
    //  los nombre de los módulos este contendrá los exports correspondientes.
    //  algo parecido a esto:
    //      imports = {
    //        one: module1_exports,
    //        two: module2_exports,
    //        three: module3_exports
    //      }
    //  De modo que, por ejemplo, el exports de 'modules/module1'
    //  estará disponible en imports.one
  })
  .catch(function(error) {
    console.log('error!!!', error);
  });
```
