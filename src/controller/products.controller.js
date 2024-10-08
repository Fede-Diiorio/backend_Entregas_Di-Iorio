import ProductRepository from '../repository/products.repository.js';

export default class Controller {

    #productRepository;

    constructor() {
        this.#productRepository = new ProductRepository();
    };

    async getPaginateProducts(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const sort = req.query.sort;
            const category = req.query.category;
            const availability = req.query.availability;

            const products = await this.#productRepository.getPaginateProducts(page, limit, sort, category, availability);

            res.status(200).json(products);

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
    };

    async getProducts(req, res) {
        try {
            const products = await this.#productRepository.getProducts();

            res.status(200).json(products);

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
        ;
    }

    async getProductById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await this.#productRepository.getProductById(productId);

            res.status(200).json(product);

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
    };

    async addProduct(req, res) {
        try {
            const { title, description, price, code, stock, category } = req.body;
            const owner = req.user.email;
            const thumbnail = req.file;
            const product = await this.#productRepository.addProduct({ title, description, price, thumbnail, code, stock, category, owner });
            req.logger.info('Producto creado de manera correcta');

            res.status(201).json(product);

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
    };

    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            const updatedProduct = await this.#productRepository.updateProduct(productId, req.body);
            req.logger.info('Producto actualizado de manera correcta');

            res.status(201).json(updatedProduct);

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
    };

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            const user = req.user
            await this.#productRepository.deleteProduct(productId, user);
            req.logger.info('Producto eliminado de manera correcta')

            res.status(204).json({ message: 'Producto eliminado' });

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        };
    };
};