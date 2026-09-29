import {
  ClientMapper,
  EventMapper,
} from "../../data/mappers/index.mapper.js";

export class InvalidEventDataError extends Error {}

function getEventResponse(event) {
  const { _id, __v, ownerId, ...eventData } = event.toObject();

  return {
    id: _id.toString(),
    ...eventData,
  };
}

function getEventData(eventData) {
  return {
    ...eventData,
    date: new Date(eventData.date),
    clientId: eventData.type === "coaching" ? eventData.clientId : undefined,
    className: eventData.type === "group-class" ? eventData.className : undefined,
  };
}

async function requireOwnedClient(clientId, ownerId) {
  const client = await ClientMapper.findClientById(clientId, ownerId);

  if (!client) {
    throw new InvalidEventDataError(
      "Le client associé au coaching est introuvable.",
    );
  }
}

export async function getAllEvents(ownerId) {
  const events = await EventMapper.findAllEvents(ownerId);
  return events.map(getEventResponse);
}

export async function getEventById(eventId, ownerId) {
  const event = await EventMapper.findEventById(eventId, ownerId);
  return event ? getEventResponse(event) : null;
}

export async function createEvent(eventData, ownerId) {
  if (eventData.type === "coaching") {
    await requireOwnedClient(eventData.clientId, ownerId);
  }

  const event = await EventMapper.createEvent({
    ...getEventData(eventData),
    ownerId,
  });

  return { id: event.id };
}

export async function updateEvent(eventId, ownerId, eventData) {
  const existingEvent = await EventMapper.findEventById(eventId, ownerId);

  if (!existingEvent) {
    return null;
  }

  const eventUpdate = { ...eventData };

  if (Object.hasOwn(eventData, "date")) {
    eventUpdate.date = new Date(eventData.date);
  }

  const eventType = eventData.type ?? existingEvent.type;

  if (eventType === "coaching") {
    const clientId = eventData.clientId ?? existingEvent.clientId;

    if (!clientId || Object.hasOwn(eventData, "className")) {
      throw new InvalidEventDataError(
        "Un coaching doit être associé à un client, sans nom de cours.",
      );
    }

    await requireOwnedClient(clientId, ownerId);

    eventUpdate.className = undefined;
  } else {
    const className = eventData.className ?? existingEvent.className;

    if (!className || Object.hasOwn(eventData, "clientId")) {
      throw new InvalidEventDataError(
        "Un cours collectif doit avoir un nom, sans client associé.",
      );
    }

    eventUpdate.clientId = undefined;
  }

  const event = await EventMapper.updateEventById(
    eventId,
    ownerId,
    eventUpdate,
  );

  return event ? { id: event.id } : null;
}

export async function deleteEvent(eventId, ownerId) {
  const event = await EventMapper.deleteEventById(eventId, ownerId);
  return event ? true : null;
}
