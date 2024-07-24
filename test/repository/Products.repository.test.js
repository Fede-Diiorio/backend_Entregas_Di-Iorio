const { ProductRepository } = require('../../src/repository/products.repository');
const sinon = require('sinon');
const chai = import('chai');
const { invalidProducts, mockingProducts } = require('../utils');

describe('Testing Product Repository', () => {
    /**
     * @type Chai.ExpectStatic
     */
    let expect;

    const productsDaoMock = {
        getProducts: sinon.stub(),
        addProduct: sinon.stub(),
        getProductById: sinon.stub()
    }

    const usersDaoMock = {

    }

    const productRepository = new ProductRepository(productsDaoMock, usersDaoMock);

    before(async function () {
        const { expect: chaiExpect } = await chai
        expect = chaiExpect
    });

    it('Debe traer todos los productos de la base de datos', async () => {
        productsDaoMock.getProducts.resolves(mockingProducts);

        const result = await productRepository.getProducts(1, 10);
        expect(result).to.deep.equal(mockingProducts);
    })

    it('Debe traer un producto según su ID', async () => {
        productsDaoMock.getProductById.resolves({
            id: 1,
            title: "Fuente Sentey 700W",
            description: "Fuente sentey 700w hbp700-gs 80 plus bronze active pfc autofan 20+4x1 4+4pinesx1 satax6 molexx 2pci-e6+2x2",
            price: 42000,
            thumbnail: "../img/Fuente.webp",
            code: "abc123",
            status: true,
            stock: 10,
            category: "fuente",
            owner: "admin"
        },)
        const test = await productRepository.getProductById(1);
    })

    it('Debe fallar cuando se intenta crear un producto inválido', async () => {
        for (const product of invalidProducts) {
            let throwError
            try {
                await productRepository.addProduct(product);
            } catch (error) {
                throwError = error;
            }
            expect(throwError.name).to.equal('Error al crear producto');
        }
    });
});
