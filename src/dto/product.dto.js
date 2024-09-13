export class ProductDTO {
    constructor({ title, description, price, thumbnail, code, status, stock, category, id, owner }) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.status = status;
        this.stock = stock;
        this.category = category;
        this.owner = owner;
        this.id = id;
    };
};