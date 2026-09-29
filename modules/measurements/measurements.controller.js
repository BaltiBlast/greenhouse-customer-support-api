import {
  createMeasurement,
  deleteMeasurement,
  getAllMeasurements,
  getMeasurementById,
  updateMeasurement,
} from "./measurements.service.js";
import {
  clientIdValidationSchema,
  createMeasurementValidationSchema,
  measurementIdValidationSchema,
  updateMeasurementValidationSchema,
} from "./measurements.validation.js";

function getValidationErrors(validationResult) {
  return validationResult.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function validateIdentifiers(req, res) {
  const clientIdResult = clientIdValidationSchema.safeParse(req.params.clientId);
  const measurementIdResult = req.params.measurementId
    ? measurementIdValidationSchema.safeParse(req.params.measurementId)
    : null;

  if (!clientIdResult.success || (measurementIdResult && !measurementIdResult.success)) {
    const invalidResult = !clientIdResult.success
      ? clientIdResult
      : measurementIdResult;

    res.status(400).json({
      message: "L'identifiant fourni est invalide.",
      errors: getValidationErrors(invalidResult),
    });
    return null;
  }

  return {
    clientId: clientIdResult.data,
    measurementId: measurementIdResult?.data,
  };
}

function sendNotFound(res) {
  return res.status(404).json({
    message: "Le client ou la mesure est introuvable.",
  });
}

export async function getAllMeasurementsController(req, res, next) {
  const identifiers = validateIdentifiers(req, res);

  if (!identifiers) return;

  try {
    const measurements = await getAllMeasurements(
      identifiers.clientId,
      req.session.userId,
    );

    return measurements === null
      ? sendNotFound(res)
      : res.status(200).json(measurements);
  } catch (error) {
    return next(error);
  }
}

export async function getMeasurementByIdController(req, res, next) {
  const identifiers = validateIdentifiers(req, res);

  if (!identifiers) return;

  try {
    const measurement = await getMeasurementById(
      identifiers.clientId,
      identifiers.measurementId,
      req.session.userId,
    );

    return measurement
      ? res.status(200).json(measurement)
      : sendNotFound(res);
  } catch (error) {
    return next(error);
  }
}

export async function createMeasurementController(req, res, next) {
  const identifiers = validateIdentifiers(req, res);
  const dataResult = createMeasurementValidationSchema.safeParse(req.body);

  if (!identifiers) return;

  if (!dataResult.success) {
    return res.status(400).json({
      message: "Les données de la mesure sont invalides.",
      errors: getValidationErrors(dataResult),
    });
  }

  try {
    const measurement = await createMeasurement(
      identifiers.clientId,
      req.session.userId,
      dataResult.data,
    );

    return measurement
      ? res.status(201).json(measurement)
      : sendNotFound(res);
  } catch (error) {
    return next(error);
  }
}

export async function updateMeasurementController(req, res, next) {
  const identifiers = validateIdentifiers(req, res);
  const dataResult = updateMeasurementValidationSchema.safeParse(req.body);

  if (!identifiers) return;

  if (!dataResult.success) {
    return res.status(400).json({
      message: "Les données de la mesure sont invalides.",
      errors: getValidationErrors(dataResult),
    });
  }

  try {
    const measurement = await updateMeasurement(
      identifiers.clientId,
      identifiers.measurementId,
      req.session.userId,
      dataResult.data,
    );

    return measurement
      ? res.status(200).json(measurement)
      : sendNotFound(res);
  } catch (error) {
    return next(error);
  }
}

export async function deleteMeasurementController(req, res, next) {
  const identifiers = validateIdentifiers(req, res);

  if (!identifiers) return;

  try {
    const measurementWasDeleted = await deleteMeasurement(
      identifiers.clientId,
      identifiers.measurementId,
      req.session.userId,
    );

    return measurementWasDeleted
      ? res.status(204).send()
      : sendNotFound(res);
  } catch (error) {
    return next(error);
  }
}
