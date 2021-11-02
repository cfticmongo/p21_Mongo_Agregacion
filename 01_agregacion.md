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