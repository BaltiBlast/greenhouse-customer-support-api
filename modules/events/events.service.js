import { EventMapper } from "../../data/mappers/index.mapper.js";

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

export function updateEvent(eventId, eventData) {
  return EventMapper.updateEventById(eventId, getEventData(eventData));
}

export function deleteEvent(eventId) {
  return EventMapper.deleteEventById(eventId);
}
