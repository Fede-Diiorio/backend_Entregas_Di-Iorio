const { ProductRepository } = require('../../src/repository/products.repository');
const sinon = require('sinon');
const chai = import('chai');
const { invalidProducts, mockingProducts } = require('../utils');

describe('Testing Product Repository', () => {
    /**
     * @type Chai.ExpectStatic
     */
    let expect;

    const productDAO = {
        addProduct: sinon.stub(),
        getProductById: sinon.stub(),
        findByCode: sinon.stub()
    }

    const userDAO = {
        findByEmail: sinon.stub()
    }

    const productRepository = new ProductRepository(productDAO, userDAO);

    before(async function () {
        const { expect: chaiExpect } = await chai
        expect = chaiExpect
    });

    it('Debe traer un producto según su ID', async () => {
        productDAO.getProductById.resolves({
            id: 1,
            title: "Fuente Sentey 700W",
            description: "Fuente sentey 700w hbp700-gs 80 plus bronze active pfc autofan 20+4x1 4+4pinesx1 satax6 molexx 2pci-e6+2x2",
            price: 42000,
            code: "abc123",
            stock: 10,
            category: "fuente",
            owner: "admin"
        },)
        const test = await productRepository.getProductById(1);
        expect(test.title).to.equal('Fuente Sentey 700W');
        expect(test.code).to.equal('abc123');
        expect(test).to.have.property('thumbnail');
        expect(test).to.have.property('status');
    });

    it('Debe crear un producto de manera correcta', async () => {
        const mockProductData = {
            title: "Fuente Sentey 700W",
            description: "Fuente sentey 700w hbp700-gs 80 plus bronze active pfc autofan 20+4x1 4+4pinesx1 satax6 molexx 2pci-e6+2x2",
            price: 42000,
            code: "abc123",
            stock: 10,
            category: "fuente",
            owner: "admin@test.com"
        }

        console.log(mockProductData);

        userDAO.findByEmail.resolves({ email: 'admin@test.com' });

        // try {
        //     const test = await productRepository.addProduct(mockProductData);
        //     console.log(test);
        // } catch (error) {
        //     console.log(error);
        // }
    });

    it('Debe fallar cuando se intenta crear un producto inválido', async () => {
        for (const product of invalidProducts) {
            let throwError
            try {
                await productRepository.addProduct(product);
            } catch (error) {
                throwError = error;
            }
            expect(throwError).to.have.property('name');

        }
    });

    it('debería lanzar un error cuando el código de producto ya existe', async () => {
        const mockProductData = {
            title: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100,
            code: 'duplicated-code',
            stock: 10,
            category: 'categoría',
            owner: 'test@example.com'
        };

        // Simula que `findByCode` devuelve un producto indicando que el código ya existe
        productDAO.findByCode.resolves({ id: 'some-id' });

        try {
            await productRepository.addProduct(mockProductData);
        } catch (error) {
            // Verifica que el error sea del tipo y con el mensaje esperado
            expect(error.status).to.equal(409);
            expect(error).to.have.property('name');
        }
    });

});
