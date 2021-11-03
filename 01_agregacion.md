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
    {$group: {_id: {nombre: "$name", edad: "$age"}, totalesMismoNombreMismaEdad: {$sum: 1}}},
    {$project: {nombre: "$_id.nombre", edad: "$_id.edad", totalesMismoNombreMismaEdad: 1, _id: 0}},
    {$sort: {totalesMismoNombreMismaEdad: -1}}
])
```

Para encontrar valores duplicados

```
use clinica
db.empleados.insert({
        nombre: "Juan",
        "dni" : "27827756B" 
})
db.empleados.insert({
        nombre: "Laura",
        "dni" : "27827756B" // Añadimos un registro con dni duplicado
})

db.empleados.aggregate([
    {$group: {_id: "$dni", contador: {$sum: 1}}},
    {$sort: {contador: -1}}
], {allowDiskUse: true})

```
Resultado
{"_id" : "27827756B", "contador" : 2 } devolverá un doc de cada valor duplicado

## Etapa $unwind

Deconstruye un array en sus elementos.

Set de datos

```
use shop2

db.items.insert([
    {nombre: "Camiseta", marca: "Nike", tallas: ["xs","s","m","l","xl","xxl"]},
    {nombre: "Camiseta", marca: "Puma", tallas: ["xs","s","xxl"]},
    {nombre: "Camiseta", marca: "Adidas", tallas: null},
    {nombre: "Pantaln", marca: "Puma"}, 
])

```

```
db.items.aggregate([
    {$unwind: "$tallas"}
])

db.items.aggregate([
    {$unwind: {path: "$tallas", preserveNullAndEmptyArrays: true}}
])
```

{
        "_id" : ObjectId("6181984133792f1bcfeaad40"),
        "name" : "Juan",
        "surname1" : "Novo",
        "surname2" : "Fernández",
        "activities" : [
                "step",
                "pesas",
                "aquagym"
        ],
        "subscriptionDate" : ISODate("2015-06-09T01:04:18.570Z")
}


Por ejemplo ver el número de clientes que están inscritos a cada actividad

```
use gimnasio2

db.clientes.aggregate([
    {$unwind: "$activities"},
    {$group: {_id: "$activities", totalClientes: {$sum: 1}}},
    {$project: {actividad: "$_id", totalClientes: 1, _id: 0}},
    {$sort: {totalClientes: -1}}
])
```

{ "totalClientes" : 663, "actividad" : "aquagym" }
{ "totalClientes" : 661, "actividad" : "esgrima" }
{ "totalClientes" : 653, "actividad" : "cardio" }
{ "totalClientes" : 644, "actividad" : "pesas" }
{ "totalClientes" : 639, "actividad" : "step" }
{ "totalClientes" : 625, "actividad" : "padel" }
{ "totalClientes" : 615, "actividad" : "tenis" }

## Etapa $match

Match realiza un filtro de documentos de la etapa anterior (colección si es la primera etapa) mediante un documento
de consulta con la misma sintaxis de los métodos find()

Por ejemplo para buscar duplicados, podemos segmentar las operaciones para evitar desbordar la memoria
en colecciones muy grandes.

```
use maraton
db.runners.insert({
        "name" : "Gonzalo",
        "surname1" : "Gonzalez",
        "surname2" : "Gonzalez",
        "age" : 96,
        "dni" : "27827756B"
})

db.runners.aggregate([
    {$match: {age: 96}}, // Un doc de consulta con la misma sintaxis de find() findOne() 
    {$group: {_id: "$dni", contador: {$sum: 1}}},
    {$match: {contador: {$gt: 1}}},
    {$sort: {contador: -1}}
])
```

Otro ejemplo con índices de texto

```
use shop3

db.opiniones.insert([
    {nombre: "Nike revolution", user: "00012", opinion: "buen servicio pero producto en mal estado"},
    {nombre: "Nike revolution", user: "00013", opinion: "muy satisfecho con la compra"},
    {nombre: "Nike revolution", user: "00014", opinion: "muy mal, tuve que devolverlas"},
    {nombre: "Adidas Peace", user: "00014", opinion: "perfecto en todos los sentidos"},
    {nombre: "Adidas Peace", user: "00013", opinion: "muy bien, muy contento"},
    {nombre: "Adidas Peace", user: "00012", opinion: "mal, no me han gustado"},
    {nombre: "Nike revolution", user: "00015", opinion: "mal, no volver"},
])

db.opiniones.createIndex({opinion: "text"})

db.opiniones.aggregate([
    {$match: {$text: {$search: "mal"}}},
    {$group: {_id: "$nombre", malasOpiniones: {$sum: 1}}},
    {$project: {producto: "$_id", malasOpiniones: 1, _id: 0}},
    {$sort: {malasOpiniones: -1}}
])

```

## Etapa $addFields

Añadir campos a partir de los valores obtenidos de expresiones

```
use maraton

db.resultados.insert([
    {nombre: 'Juan', horaLlegada: new Date("2021-11-03T16:31:40")},
    {nombre: 'Laura', horaLlegada: new Date("2021-11-03T15:43:27")},
    {nombre: 'Sara', horaLlegada: new Date("2021-11-03T17:10:22")},
    {nombre: 'Carlos', horaLlegada: new Date("2021-11-03T16:15:09")},
])


db.resultados.aggregate([
    {$addFields: {tiempo: {$subtract: ["$horaLlegada", new Date("2021-11-03T12:00:00")]}}},
    {$addFields: {horas: {$floor: {$mod: [{$divide: ["$tiempo", 60 * 60 * 1000]}, 24]}}}},
    {$addFields: {minutos: {$floor: {$mod: [{$divide: ["$tiempo", 60 * 1000]}, 60]}}}},
    {$addFields: {segundos: {$floor: {$mod: [{$divide: ["$tiempo", 1000]}, 60]}}}},
    {$sort: {tiempo: 1}},
    {$project: {nombre: 1, horas: 1, minutos: 1, segundos: 1, _id: 0}}
])

```

## Etapa $skip

Recibe un entero para saltar los n primeros documentos de la etapa (similar a skip())

{$skip: <entero>}

## Etapa $limit

Recibe un entero para limitar los n documentos de la etapa (similar limit())

{$limit: <entero>}

## Etapa $merge

Sirve para registrar los resultados de la operación de agregación a otra colección de otra base de datos
(por tanto será la última etapa del pipe)

```
use maraton

db.runners.aggregate([
    {$group: {_id: "$age", total: {$sum: 1}}},
    {$project: {age: "$_id", total: 1, _id: 0}},
    {$merge: "resumen"} // Colección en la misma base de datos
])

db.resumen.find()
{ "_id" : ObjectId("6182db50ff78b325181e6007"), "age" : 15, "total" : 10247 }
{ "_id" : ObjectId("6182db50ff78b325181e6008"), "age" : 64, "total" : 10087 }
{ "_id" : ObjectId("6182db50ff78b325181e6009"), "age" : 19, "total" : 10056 }
{ "_id" : ObjectId("6182db50ff78b325181e600a"), "age" : 90, "total" : 9934 }
{ "_id" : ObjectId("6182db50ff78b325181e600b"), "age" : 0, "total" : 9877 }
...
```

Otro ejemplo a colección de otra base de datos y controlando la inserción de documentos

```
db.runners.createIndex({dni: 1},{unique: true})  // Exige índice único sobre el campo de control

db.runners.aggregate([
    {$match: {$and: [{age: {$gte: 40}},{age:{$lt: 41}}]}},
    {$project: {name: 1, age: 1, dni: 1, _id: 0}},
    {$merge: {
        into: {db: "maratonMadrid", coll: "resumen4042"},
        on: "dni",
        whenMatched: "keepExisting",
        whenNotMatched: "insert" // Solo insertará los nuevos docs
    }}
])
```

## Etapa $lookup

Esta etapa permite utilizar en MongoDB un tipo de joins (left outer)

Sintaxis
{$lookup: {
    from: <colección-externa>,
    localField: <campo-colección-referencia>,
    foreignField: <campo-colección-externa-referencia>,
    as: <nombre-campo-de-salida (array)>
}}


```
use shop4

db.pedidos.insert([
    {items: [
        {codigo: "a01", precio: 12, cantidad: 2},
        {codigo: "j02", precio: 10, cantidad: 4},
    ]},
    {items: [
        {codigo: "j01", precio: 20, cantidad: 1}
    ]},
    {items: [
        {codigo: "j01", precio: 20, cantidad: 4}
    ]},
])

db.productos.insert([
    {codigo: "a01", descripción: "Tuerca 14", stock: 100},
    {codigo: "a02", descripción: "Tuerca 20", stock: 50},
    {codigo: "j01", descripción: "Chapa 200", stock: 100},
    {codigo: "j02", descripción: "Chapa 300", stock: 150},
])

```

Caso de uso de agregación desde la colección pedidos para obtener
los datos de cada producto vendido (de la colección productos)

```
db.pedidos.aggregate([
    {$unwind: "$items"},
    {$lookup: {
        from: "productos",
        localField: "items.codigo",
        foreignField: "codigo",
        as: "producto"
    }},
    {$unwind: "$producto"},
    {$project: {
        numeroPedido: "$_id",
        producto: "$producto.codigo",
        descripcion: "$producto.descripción",
        cantidad: "$items.cantidad",
        precio: "$items.precio",
        _id: 0
    }}
])
```

{ "numeroPedido" : ObjectId("6182e44445b5fa4069845770"), "producto" : "a01", "descripcion" : "Tuerca 14", "cantidad" : 2, "precio" : 12 }
{ "numeroPedido" : ObjectId("6182e44445b5fa4069845770"), "producto" : "j02", "descripcion" : "Chapa 300", "cantidad" : 4, "precio" : 10 }
{ "numeroPedido" : ObjectId("6182e44445b5fa4069845771"), "producto" : "j01", "descripcion" : "Chapa 200", "cantidad" : 1, "precio" : 20 }
{ "numeroPedido" : ObjectId("6182e44445b5fa4069845772"), "producto" : "j01", "descripcion" : "Chapa 200", "cantidad" : 4, "precio" : 20 }