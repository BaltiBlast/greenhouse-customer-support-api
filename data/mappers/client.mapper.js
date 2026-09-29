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

  findClientById(clientId, ownerId) {
    return this.model.findOne({ _id: clientId, ownerId });
  }

  findAllClients(ownerId) {
    return this.model.find({ ownerId });
  }

  updateClientById(clientId, ownerId, clientData) {
    const fieldsToSet = {};
    const fieldsToUnset = {};

    Object.entries(clientData).forEach(([field, value]) => {
      if (value === undefined) {
        fieldsToUnset[field] = 1;
      } else {
        fieldsToSet[field] = value;
      }
    });

    return this.model.findOneAndUpdate(
      { _id: clientId, ownerId },
      {
        $set: fieldsToSet,
        ...(Object.keys(fieldsToUnset).length ? { $unset: fieldsToUnset } : {}),
      },
      { returnDocument: "after", runValidators: true },
    );
  }

  deleteClientById(clientId, ownerId, session) {
    return this.model.findOneAndDelete(
      { _id: clientId, ownerId },
      { session },
    );
  }
}

export default Client;
