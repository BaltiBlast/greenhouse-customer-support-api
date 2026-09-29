import { EventMapper } from "../../data/mappers/index.mapper.js";

export class InvalidEventUpdateError extends Error {}

function getEventResponse(event) {
  const { _id, __v, ...eventData } = event.toObject();

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

export async function getAllEvents() {
  const events = await EventMapper.findAllEvents();
  return events.map(getEventResponse);
}

export async function getEventById(eventId) {
  const event = await EventMapper.findEventById(eventId);
  return event ? getEventResponse(event) : null;
}

export function createEvent(eventData) {
  return EventMapper.createEvent(getEventData(eventData));
}

export async function updateEvent(eventId, eventData) {
  const existingEvent = await EventMapper.findEventById(eventId);

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
      throw new InvalidEventUpdateError(
        "Un coaching doit être associé à un client, sans nom de cours.",
      );
    }

    eventUpdate.className = undefined;
  } else {
    const className = eventData.className ?? existingEvent.className;

    if (!className || Object.hasOwn(eventData, "clientId")) {
      throw new InvalidEventUpdateError(
        "Un cours collectif doit avoir un nom, sans client associé.",
      );
    }

    eventUpdate.clientId = undefined;
  }

  return EventMapper.updateEventById(eventId, eventUpdate);
}

export function deleteEvent(eventId) {
  return EventMapper.deleteEventById(eventId);
}
