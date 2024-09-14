export const invalidProducts = [
    // Producto vacío
    {},
    // Producto sin título
    {
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto sin descripción
    {
        title: "Título del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto sin precio
    {
        title: "Título del producto",
        description: "Descripción del producto",
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto con precio inválido (no es un número)
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: "precioInválido",
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto con precio inválido (menor o igual a 0)
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: -10,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto sin código
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        stock: 10,
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto sin categoría
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: 10,
        owner: "owner@example.com"
    },
    // Producto sin stock
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto con stock inválido (no es un número)
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: "stockInválido",
        category: "Categoría",
        owner: "owner@example.com"
    },
    // Producto con stock inválido (menor a 0)
    {
        title: "Título del producto",
        description: "Descripción del producto",
        price: 100,
        thumbnail: "path/to/thumbnail.jpg",
        code: "CODE123",
        stock: -5,
        category: "Categoría",
        owner: "owner@example.com"
    }
];