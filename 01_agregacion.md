# Agregación en MongoDB

Pipe de etapas de transformación de datos ejecutada en memoria.

Sintaxis
db.<coleccion>.aggregate([
    {etapa1},
    {etapa2},
    ...
], {allowDiskUse: <boolean>}) // Elimina el límite de uso de memoria de 100MB en cada etapa

Cada etapa tiene una sintaxis

{$<operador-etapa>: {$<operador-agregación>: <expresion>, ...}}

El resultado se devuelve a quien realiza la operación (shell o driver) o se almacena en otra colección.

Las operaciones de agregación mantienen inmutable la colección donde se ejecutan.

## Etapa $project

```
use biblioteca

db.libros.aggregate([
    {$project: {titulo: 1, autor: 1, _id: 0}} // Idéntica sintaxis y operadores que en proyección de los métodos find()
])
```

Cada etapa devuelve un set de datos que será utilizado por la siguiente etapa y además disponemos de los
field-reference "$<nombre-campo-etapa-anterior>, que permiten obtener los valores de cada documento e insertarlos 
en un nuevo campo.

```
db.libros.aggregate([
    {$project: {titulo: 1, autor: 1, _id: 0}},
    {$project: {title: "$titulo", author: "$autor"}}
])
```

## Etapa $sort

Set de datos

Ver archivo data.js

```
use gimnasio2

db.clientes.aggregate([
    {$project: {cliente: {$toUpper: "$surname1"}, _id: 0}},
    {$sort: {cliente: 1}} // $sort recibe un doc con la misma sintaxis que el método sort()
])
```

Otro ejemplo con extracción de valores de fecha en campos de ese tipo

```
db.clientes.aggregate([
    {$project: {name: 1, surname1: 1, surname2: 1, mesAlta: {$month: "$subscriptionDate"}}}, // $month extrae el mes de fecha
    {$sort: {mesAlta: -1, surname1: 1, surname2: 1, name: 1}}
])
```

## Etapa $group

Sintaxis

{
    $group: {
        _id: <expresión>, // Agrupa en el campo _id por los valores de la expresión
        <campo>: {<acumulador>: <expresión>},
        ...
    }
}

```
db.clientes.aggregate([
    {$project: {mesAlta: {$month: "$subscriptionDate"}, _id: 0}},
    {$group: {_id: "$mesAlta", numeroAltasMes: {$sum: 1}}},
    {$project: {mes: "$_id", numeroAltasMes: 1, _id: 0}},
    {$sort: {numeroAltasMes: -1}}
])
```

Set de datos

```
use shop

db.pedidos.insert([
    {sku: 'V101', cantidad: 12, precio: 20, fecha: ISODate("2021-09-20")},
    {sku: 'V101', cantidad: 6, precio: 20, fecha: ISODate("2021-09-28")},
    {sku: 'V101', cantidad: 4, precio: 20, fecha: ISODate("2021-09-29")},
    {sku: 'V102', cantidad: 7, precio: 10.3, fecha: ISODate("2021-09-24")},
    {sku: 'V102', cantidad: 5, precio: 10.9, fecha: ISODate("2021-09-26")},
])

```

Por ejemplo podemos obtener las ventas por día de semana

```
db.pedidos.aggregate([
    {$group: {_id: {$dayOfWeek: "$fecha"}, totalVentas: {$sum: {$multiply: ["$cantidad","$precio"]}}}},
    {$project: {diaSemana: "$_id", totalVentas: 1, _id: 0}},
    {$sort: {diaSemana: 1}}
])
```

Por ejemplo podemos obtener la cantidad promedio de producto

```
db.pedidos.aggregate([
    {$group: {_id: "$sku", cantidadPromedio: {$avg: "$cantidad"}}},
    {$project: {skuProducto: "$_id", cantidadPromedio: 1, _id: 0}},
    {$sort: {skuProducto: 1}}
])
```

Por ejemplo podemos crear arrays de valores

```
use biblioteca

db.libros.aggregate([
    {$group: {_id: "$autor", libros: {$push: "$titulo"}}},
    {$project: {autor: "$_id", libros: 1, _id: 0}},
    {$sort: {autor: 1}}
])

```

Por ejemplo, podemos obtener el número de participantes que se llaman igual y tienen el mismo nombre

```
use maraton

db.runners.aggregate([
    {$group: {_id: {nombre: "$name", edad: "$age"}, totalesMismoNombreMismaEdad: {$sum: 1}}}
    {$project: {nombre: "$_id.nombre", edad: "$_id.edad", totalesMismoNombreMismaEdad: 1, _id: 0}}
    {$sort: {totalesMismoNombreMismaEdad: -1}}
])
```