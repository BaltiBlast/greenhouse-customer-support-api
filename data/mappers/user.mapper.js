import CoreMapper from "./core.mapper.js";
import userSchema from "../schemas/user.schema.js";

class User extends CoreMapper {
  constructor(mongoose) {
    super(mongoose);

    this.model =
      this.mongoose.models.User ||
      this.mongoose.model("User", userSchema, "users");
  }

  findUserByEmail(email) {
    return this.model.findOne({ email }).select("+passwordHash");
  }

  createUser(userData) {
    return this.model.create(userData);
  }

  findUserById(userId) {
    return this.model.findById(userId);
  }
}

export default User;
