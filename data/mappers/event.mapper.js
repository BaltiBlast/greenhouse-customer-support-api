import CoreMapper from "./core.mapper.js";
import eventSchema from "../schemas/event.schema.js";

class Event extends CoreMapper {
  constructor(mongoose) {
    super(mongoose);

    this.model =
      this.mongoose.models.Event ||
      this.mongoose.model("Event", eventSchema, "events");
  }

  createEvent(eventData) {
    return this.model.create(eventData);
  }

  findEventById(eventId, ownerId) {
    return this.model.findOne({ _id: eventId, ownerId });
  }

  findAllEvents(ownerId) {
    return this.model.find({ ownerId });
  }

  updateEventById(eventId, ownerId, eventData) {
    const fieldsToSet = {};
    const fieldsToUnset = {};

    Object.entries(eventData).forEach(([field, value]) => {
      if (value === undefined) {
        fieldsToUnset[field] = 1;
      } else {
        fieldsToSet[field] = value;
      }
    });

    return this.model.findOneAndUpdate(
      { _id: eventId, ownerId },
      {
        $set: fieldsToSet,
        ...(Object.keys(fieldsToUnset).length ? { $unset: fieldsToUnset } : {}),
      },
      { returnDocument: "after", runValidators: true },
    );
  }

  deleteEventById(eventId, ownerId) {
    return this.model.findOneAndDelete({ _id: eventId, ownerId });
  }
}

export default Event;
