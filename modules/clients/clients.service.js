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

  const clientUpdate = {};
  const directFields = [
    "firstName",
    "lastName",
    "objectives",
    "pathologies",
    "limitations",
    "hasEatingDisorder",
  ];

  directFields.forEach((field) => {
    if (Object.hasOwn(clientData, field)) {
      clientUpdate[field] = clientData[field];
    }
  });

  if (Object.hasOwn(clientData, "birthDate")) {
    clientUpdate.birthDate = new Date(clientData.birthDate);
  }

  const emergencyContactFields = {
    emergencyContactName: "name",
    emergencyContactRelationship: "relationship",
    emergencyContactPhone: "phone",
  };
  const hasEmergencyContactUpdate = Object.keys(emergencyContactFields).some(
    (field) => Object.hasOwn(clientData, field),
  );

  if (hasEmergencyContactUpdate) {
    const emergencyContact = {
      name: existingClient.emergencyContact?.name,
      relationship: existingClient.emergencyContact?.relationship,
      phone: existingClient.emergencyContact?.phone,
    };

    Object.entries(emergencyContactFields).forEach(([inputField, storedField]) => {
      if (Object.hasOwn(clientData, inputField)) {
        emergencyContact[storedField] = clientData[inputField];
      }
    });

    clientUpdate.emergencyContact = Object.values(emergencyContact).some(Boolean)
      ? emergencyContact
      : undefined;
  }

  const measurementFields = ["height", "weight", "bodyFat", "muscleMass"];
  const hasMeasurementUpdate = measurementFields.some((field) =>
    Object.hasOwn(clientData, field),
  );

  if (hasMeasurementUpdate) {
    const measurements = existingClient.measurements.map((measurement) => ({
      measuredAt: measurement.measuredAt,
      height: measurement.height,
      weight: measurement.weight,
      bodyFat: measurement.bodyFat,
      muscleMass: measurement.muscleMass,
    }));
    const latestMeasurement = { ...measurements.at(-1) };

    measurementFields.forEach((field) => {
      if (Object.hasOwn(clientData, field)) {
        latestMeasurement[field] = clientData[field];
      }
    });

    measurements[measurements.length - 1] = latestMeasurement;
    clientUpdate.measurements = measurements;
  }

  return ClientMapper.updateClientById(clientId, clientUpdate);
}

export function deleteClient(clientId) {
  return ClientMapper.deleteClientById(clientId);
}
