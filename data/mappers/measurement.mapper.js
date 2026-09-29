import CoreMapper from "./core.mapper.js";
import measurementSchema from "../schemas/measurement.schema.js";

class Measurement extends CoreMapper {
  constructor(mongoose) {
    super(mongoose);

    this.model =
      this.mongoose.models.Measurement ||
      this.mongoose.model(
        "Measurement",
        measurementSchema,
        "measurements",
      );
  }

  createMeasurement(measurementData) {
    return this.model.create(measurementData);
  }

  findMeasurementsByClientId(clientId) {
    return this.model.find({ clientId }).sort({ measuredAt: -1 });
  }

  findMeasurementByIdAndClientId(measurementId, clientId) {
    return this.model.findOne({ _id: measurementId, clientId });
  }

  updateMeasurementByIdAndClientId(measurementId, clientId, measurementData) {
    const fieldsToSet = {};
    const fieldsToUnset = {};

    Object.entries(measurementData).forEach(([field, value]) => {
      if (value === undefined) {
        fieldsToUnset[field] = 1;
      } else {
        fieldsToSet[field] = value;
      }
    });

    return this.model.findOneAndUpdate(
      { _id: measurementId, clientId },
      {
        $set: fieldsToSet,
        ...(Object.keys(fieldsToUnset).length ? { $unset: fieldsToUnset } : {}),
      },
      { returnDocument: "after", runValidators: true },
    );
  }

  deleteMeasurementByIdAndClientId(measurementId, clientId) {
    return this.model.findOneAndDelete({ _id: measurementId, clientId });
  }

  deleteMeasurementsByClientId(clientId, session) {
    return this.model.deleteMany({ clientId }, { session });
  }
}

export default Measurement;
