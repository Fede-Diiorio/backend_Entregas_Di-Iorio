const { Products } = require('../models');

class ProductManager {

    constructor() { }

    async prepare() {
        // No hacer nada. 
        // Podríamos chequear que la conexión existe y está funcionando
        if (Products.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
    }

    async getProducts(page) {
        try {
            const allProducts = await Products.paginate({}, { limit: 10, page: page, lean: true });
            return allProducts;
        } catch {
            // En caso de que no haya productos se retorna un array vacio
            return [];
        }
    }

    async getProductById(id) {
        try {
            // Buscar el producto por su ID utilizando findOne
            const product = await Products.findOne({ _id: id });

            if (product) {
                return product;
            } else {
                throw new Error('Not Found: El ID solicitado no existe.');
            }
        } catch (error) {
            // Manejar cualquier error que ocurra durante la consulta
            console.error('Error al obtener el producto por ID:', error);
            throw new Error('Error al obtener el producto por ID');
        }
    }


    // Agregar un nuevo producto
    async addProduct(title, description, price, thumbnail, code, status, stock) {
        // Validaciones y asignaciones de valores predeterminados

        const invalidOptions = isNaN(+price) || +price <= 0 || isNaN(+stock) || +stock < 0;

        if (!title || !description || !code || invalidOptions) {
            throw new Error('Error al validar los datos');
        };

        const finalThumbnail = thumbnail ? thumbnail : 'Sin Imagen';

        // Si no se carga nada en este parámetro se generará como true por defecto
        if (typeof status === 'undefined' || status === true || status === 'true') {
            status = true;
        } else {
            status = false;
        }

        try {
            await Products.create({
                title,
                description,
                price,
                thumbnail: finalThumbnail,
                code,
                status,
                stock,
            });

            console.log('Producto agregado correctamente');
        } catch (error) {
            console.error('Error al agregar el producto desde DB:', error);
            throw new Error('Error al agregar el producto desde DB');
        }
    }

    async updateProduct(id, fieldsToUpdate) {
        try {
            // Verificar si se proporcionaron campos para actualizar
            const areFieldsPresent = Object.keys(fieldsToUpdate).length > 0;

            if (!areFieldsPresent) {
                throw new Error('No se proporcionaron campos para actualizar');
            }

            // Actualizar el producto
            const updatedProduct = await Products.updateOne({ _id: id }, { $set: fieldsToUpdate });

            if (updatedProduct.nModified === 0) {
                throw new Error('No se encontró el producto para actualizar');
            }

            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar el producto desde DB:', error);
            throw new Error('Error al actualizar el producto desde DB');
        }
    }

    async deleteProduct(productId) {
        try {
            await Products.deleteOne({ _id: productId });
        } catch (error) {
            throw new Error('Error al eliminar el producto en la base de datos');
        }
    }
}

module.exports = ProductManager;