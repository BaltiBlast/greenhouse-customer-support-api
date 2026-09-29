import {
  ClientMapper,
  EventMapper,
} from "../../data/mappers/index.mapper.js";

function getClientInformation(clientData) {
  const {
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

  return clientToCreate;
}

function getClientResponse(client) {
  const { _id, __v, ownerId, ...clientData } = client.toObject();

  return {
    id: _id.toString(),
    ...clientData,
  };
}

export async function getAllClients(ownerId) {
  const clients = await ClientMapper.findAllClients(ownerId);
  return clients.map(getClientResponse);
}

export async function getClientById(clientId, ownerId) {
  const client = await ClientMapper.findClientById(clientId, ownerId);
  return client ? getClientResponse(client) : null;
}

export async function createClient(clientData, ownerId) {
  const clientInformation = getClientInformation(clientData);

  const client = await ClientMapper.createClient({
    ownerId,
    ...clientInformation,
  });

  return { id: client.id };
}

export async function updateClient(clientId, ownerId, clientData) {
  const existingClient = await ClientMapper.findClientById(clientId, ownerId);

  if (!existingClient) {
    return null;
  }

  const clientUpdate = {};
  const directFields = [
    "firstName",
    "lastName",
    "height",
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

  const client = await ClientMapper.updateClientById(
    clientId,
    ownerId,
    clientUpdate,
  );

  return client ? { id: client.id } : null;
}

export function deleteClient(clientId, ownerId) {
  return ClientMapper.withTransaction(async (session) => {
    const client = await ClientMapper.deleteClientById(
      clientId,
      ownerId,
      session,
    );

    if (!client) {
      return null;
    }

    await EventMapper.deleteEventsByClientId(clientId, ownerId, session);
    return true;
  });
}
