class UserDTO {
    constructor(user) {
        this.id = user._id ? user._id.toString() : null;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.age = user.age;
        this.email = user.email;
        this.rol = user.rol;
        this.cart = user.cart ? user.cart._id.toString() : 'noCart';
        this.documents = user.documents
        this.picture = user.picture || 'noPicture'
    }
}

module.exports = { UserDTO };
