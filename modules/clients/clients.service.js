import { ClientMapper } from "../../data/mappers/index.mapper.js";

function getClientInformation(clientData) {
  const {
    height,
    weight,
    bodyFat,
    muscleMass,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactPhone,
    ...clientInformation
  } = clientData;
  const hasEmergencyContact =
    emergencyContactName ||
    emergencyContactRelationship ||
    emergencyContactPhone;
  const clientToCreate = {
    ...clientInformation,
    birthDate: new Date(clientData.birthDate),
    emergencyContact: hasEmergencyContact
      ? {
          name: emergencyContactName,
          relationship: emergencyContactRelationship,
          phone: emergencyContactPhone,
        }
      : undefined,
  };

  return {
    clientInformation: clientToCreate,
    measurement: {
      height,
      weight,
      bodyFat,
      muscleMass,
    },
  };
}

function getClientResponse(client) {
  const { _id, __v, ...clientData } = client.toObject();

  return {
    id: _id.toString(),
    ...clientData,
  };
}

export async function getAllClients() {
  const clients = await ClientMapper.findAllClients();
  return clients.map(getClientResponse);
}

export async function getClientById(clientId) {
  const client = await ClientMapper.findClientById(clientId);
  return client ? getClientResponse(client) : null;
}

export function createClient(clientData) {
  const { clientInformation, measurement } = getClientInformation(clientData);

  return ClientMapper.createClient({
    ...clientInformation,
    measurements: [measurement],
  });
}

export async function updateClient(clientId, clientData) {
  const existingClient = await ClientMapper.findClientById(clientId);

  if (!existingClient) {
    return null;
  }

  const { clientInformation, measurement } = getClientInformation(clientData);
  const measurements = existingClient.measurements.map((existingMeasurement) => ({
    measuredAt: existingMeasurement.measuredAt,
    height: existingMeasurement.height,
    weight: existingMeasurement.weight,
    bodyFat: existingMeasurement.bodyFat,
    muscleMass: existingMeasurement.muscleMass,
  }));

  measurements[measurements.length - 1] = {
    ...measurements.at(-1),
    ...measurement,
  };

  return ClientMapper.updateClientById(clientId, {
    ...clientInformation,
    measurements,
  });
}

export function deleteClient(clientId) {
  return ClientMapper.deleteClientById(clientId);
}
