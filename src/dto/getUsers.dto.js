export class getUsersDTO {
    constructor(user) {
        this.id = user._id ? user._id.toString() : null;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.rol = user.rol;
    };
};