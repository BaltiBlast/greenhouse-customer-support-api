import {
  ClientMapper,
  MeasurementMapper,
} from "../../data/mappers/index.mapper.js";

function getMeasurementResponse(measurement) {
  const { _id, __v, clientId, ...measurementData } = measurement.toObject();

  return {
    id: _id.toString(),
    ...measurementData,
  };
}

function getMeasurementData(measurementData) {
  return {
    ...measurementData,
    ...(Object.hasOwn(measurementData, "measuredAt")
      ? { measuredAt: new Date(measurementData.measuredAt) }
      : {}),
  };
}

async function clientBelongsToOwner(clientId, ownerId) {
  return Boolean(await ClientMapper.findClientById(clientId, ownerId));
}

export async function getAllMeasurements(clientId, ownerId) {
  if (!(await clientBelongsToOwner(clientId, ownerId))) {
    return null;
  }

  const measurements = await MeasurementMapper.findMeasurementsByClientId(clientId);
  return measurements.map(getMeasurementResponse);
}

export async function getMeasurementById(clientId, measurementId, ownerId) {
  if (!(await clientBelongsToOwner(clientId, ownerId))) {
    return null;
  }

  const measurement = await MeasurementMapper.findMeasurementByIdAndClientId(
    measurementId,
    clientId,
  );

  return measurement ? getMeasurementResponse(measurement) : null;
}

export async function createMeasurement(clientId, ownerId, measurementData) {
  if (!(await clientBelongsToOwner(clientId, ownerId))) {
    return null;
  }

  const measurement = await MeasurementMapper.createMeasurement({
    clientId,
    ...getMeasurementData(measurementData),
  });

  return { id: measurement.id };
}

export async function updateMeasurement(
  clientId,
  measurementId,
  ownerId,
  measurementData,
) {
  if (!(await clientBelongsToOwner(clientId, ownerId))) {
    return null;
  }

  const measurement = await MeasurementMapper.updateMeasurementByIdAndClientId(
    measurementId,
    clientId,
    getMeasurementData(measurementData),
  );

  return measurement ? { id: measurement.id } : null;
}

export async function deleteMeasurement(clientId, measurementId, ownerId) {
  if (!(await clientBelongsToOwner(clientId, ownerId))) {
    return null;
  }

  const measurement = await MeasurementMapper.deleteMeasurementByIdAndClientId(
    measurementId,
    clientId,
  );

  return measurement ? true : null;
}
