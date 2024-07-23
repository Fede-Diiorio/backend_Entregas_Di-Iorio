const { ProductRepository } = require('../repository/products.repository');
const { generateProduct } = require('../utils/generatePoduct');
const ProductDAO = require('../dao/mongo/products.dao');
const UserDAO = require('../dao/mongo/users.dao');

const productDAO = new ProductDAO();
const userDAO = new UserDAO();

class Controller {
    constructor() {
        this.productRepository = new ProductRepository(productDAO, userDAO);
    }

    async getProducts(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const sort = req.query.sort;
            const category = req.query.category;
            const availability = req.query.availability;

            const products = await this.productRepository.getProducts(page, limit, sort, category, availability);
            res.status(200).json(products);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async getProductById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await this.productRepository.getProductById(productId);
            res.status(200).json(product);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async getMockingProducts(res) {
        try {
            const products = [];
            for (let i = 0; i < 50; i++) {
                products.push(generateProduct());
            }
            res.json(products);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async addProduct(req, res) {
        try {
            const { title, description, price, code, stock, category } = req.body;
            const owner = req.user.email;
            const thumbnail = req.file;
            const product = await this.productRepository.addProduct({ title, description, price, thumbnail, code, stock, category, owner });
            req.logger.info('Producto creado de manera correcta');
            res.status(201).json(product);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            const updatedProduct = await this.productRepository.updateProduct(productId, req.body);
            req.logger.info('Producto actualizado de manera correcta');
            res.status(201).json(updatedProduct);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            const user = req.user
            await this.productRepository.deleteProduct(productId, user);
            req.logger.info('Producto eliminado de manera correcta')
            res.status(204).json({ message: 'Producto eliminado' });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}

module.exports = { Controller };
