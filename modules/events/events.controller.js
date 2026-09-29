import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  InvalidEventUpdateError,
  updateEvent,
} from "./events.service.js";
import {
  createEventValidationSchema,
  eventIdValidationSchema,
  updateEventValidationSchema,
} from "./events.validation.js";

function getValidationErrors(validationResult) {
  return validationResult.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function sendInvalidEventId(res, validationResult) {
  return res.status(400).json({
    message: "L'identifiant de l'événement est invalide.",
    errors: getValidationErrors(validationResult),
  });
}

export async function getAllEventsController(req, res, next) {
  try {
    const events = await getAllEvents();
    return res.status(200).json(events);
  } catch (error) {
    return next(error);
  }
}

export async function getEventByIdController(req, res, next) {
  const validationResult = eventIdValidationSchema.safeParse(req.params.eventId);

  if (!validationResult.success) {
    return sendInvalidEventId(res, validationResult);
  }

  try {
    const event = await getEventById(validationResult.data);

    if (!event) {
      return res.status(404).json({ message: "L'événement est introuvable." });
    }

    return res.status(200).json(event);
  } catch (error) {
    return next(error);
  }
}

export async function createEventController(req, res, next) {
  const validationResult = createEventValidationSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Les données de l'événement sont invalides.",
      errors: getValidationErrors(validationResult),
    });
  }

  try {
    const event = await createEvent(validationResult.data);
    return res.status(201).json({ id: event.id });
  } catch (error) {
    return next(error);
  }
}

export async function updateEventController(req, res, next) {
  const idValidationResult = eventIdValidationSchema.safeParse(req.params.eventId);
  const dataValidationResult = updateEventValidationSchema.safeParse(req.body);

  if (!idValidationResult.success) {
    return sendInvalidEventId(res, idValidationResult);
  }

  if (!dataValidationResult.success) {
    return res.status(400).json({
      message: "Les données de l'événement sont invalides.",
      errors: getValidationErrors(dataValidationResult),
    });
  }

  try {
    const event = await updateEvent(idValidationResult.data, dataValidationResult.data);

    if (!event) {
      return res.status(404).json({ message: "L'événement est introuvable." });
    }

    return res.status(200).json({ id: event.id });
  } catch (error) {
    if (error instanceof InvalidEventUpdateError) {
      return res.status(400).json({ message: error.message });
    }

    return next(error);
  }
}

export async function deleteEventController(req, res, next) {
  const validationResult = eventIdValidationSchema.safeParse(req.params.eventId);

  if (!validationResult.success) {
    return sendInvalidEventId(res, validationResult);
  }

  try {
    const event = await deleteEvent(validationResult.data);

    if (!event) {
      return res.status(404).json({ message: "L'événement est introuvable." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
