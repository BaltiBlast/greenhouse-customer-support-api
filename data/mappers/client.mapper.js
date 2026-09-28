import CoreMapper from "./core.mapper.js";
import clientSchema from "../schemas/client.schema.js";

class Client extends CoreMapper {
  constructor(mongoose) {
    super(mongoose);

    this.model =
      this.mongoose.models.Client ||
      this.mongoose.model("Client", clientSchema, "clients");
  }

  createClient(clientData) {
    return this.model.create(clientData);
  }

  findClientById(clientId) {
    return this.model.findById(clientId);
  }

  findAllClients() {
    return this.model.find();
  }

  updateClientById(clientId, clientData) {
    const fieldsToSet = {};
    const fieldsToUnset = {};

    Object.entries(clientData).forEach(([field, value]) => {
      if (value === undefined) {
        fieldsToUnset[field] = 1;
      } else {
        fieldsToSet[field] = value;
      }
    });

    return this.model.findByIdAndUpdate(
      clientId,
      {
        $set: fieldsToSet,
        ...(Object.keys(fieldsToUnset).length ? { $unset: fieldsToUnset } : {}),
      },
      { returnDocument: "after", runValidators: true },
    );
  }

  deleteClientById(clientId) {
    return this.model.findByIdAndDelete(clientId);
  }
}

export default Client;
