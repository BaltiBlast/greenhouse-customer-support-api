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

  findEventById(eventId) {
    return this.model.findById(eventId);
  }

  findAllEvents() {
    return this.model.find();
  }

  updateEventById(eventId, eventData) {
    const fieldsToSet = {};
    const fieldsToUnset = {};

    Object.entries(eventData).forEach(([field, value]) => {
      if (value === undefined) {
        fieldsToUnset[field] = 1;
      } else {
        fieldsToSet[field] = value;
      }
    });

    return this.model.findByIdAndUpdate(
      eventId,
      {
        $set: fieldsToSet,
        ...(Object.keys(fieldsToUnset).length ? { $unset: fieldsToUnset } : {}),
      },
      { returnDocument: "after", runValidators: true },
    );
  }

  deleteEventById(eventId) {
    return this.model.findByIdAndDelete(eventId);
  }
}

export default Event;
