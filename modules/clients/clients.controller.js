import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  updateClient,
} from "./clients.service.js";
import {
  clientIdValidationSchema,
  createClientValidationSchema,
  updateClientValidationSchema,
} from "./clients.validation.js";

function getValidationErrors(validationResult) {
  return validationResult.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function sendInvalidClientId(res, validationResult) {
  return res.status(400).json({
    message: "L'identifiant du client est invalide.",
    errors: getValidationErrors(validationResult),
  });
}

export async function getAllClientsController(req, res, next) {
  try {
    const clients = await getAllClients(req.session.userId);
    return res.status(200).json(clients);
  } catch (error) {
    return next(error);
  }
}

export async function getClientByIdController(req, res, next) {
  const validationResult = clientIdValidationSchema.safeParse(req.params.clientId);

  if (!validationResult.success) {
    return sendInvalidClientId(res, validationResult);
  }

  try {
    const client = await getClientById(validationResult.data, req.session.userId);

    if (!client) {
      return res.status(404).json({ message: "Le client est introuvable." });
    }

    return res.status(200).json(client);
  } catch (error) {
    return next(error);
  }
}

export async function createClientController(req, res, next) {
  const validationResult = createClientValidationSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Les données du client sont invalides.",
      errors: getValidationErrors(validationResult),
    });
  }

  try {
    const client = await createClient(validationResult.data, req.session.userId);
    return res.status(201).json({ id: client.id });
  } catch (error) {
    return next(error);
  }
}

export async function updateClientController(req, res, next) {
  const idValidationResult = clientIdValidationSchema.safeParse(req.params.clientId);
  const dataValidationResult = updateClientValidationSchema.safeParse(req.body);

  if (!idValidationResult.success) {
    return sendInvalidClientId(res, idValidationResult);
  }

  if (!dataValidationResult.success) {
    return res.status(400).json({
      message: "Les données du client sont invalides.",
      errors: getValidationErrors(dataValidationResult),
    });
  }

  try {
    const client = await updateClient(
      idValidationResult.data,
      req.session.userId,
      dataValidationResult.data,
    );

    if (!client) {
      return res.status(404).json({ message: "Le client est introuvable." });
    }

    return res.status(200).json({ id: client.id });
  } catch (error) {
    return next(error);
  }
}

export async function deleteClientController(req, res, next) {
  const validationResult = clientIdValidationSchema.safeParse(req.params.clientId);

  if (!validationResult.success) {
    return sendInvalidClientId(res, validationResult);
  }

  try {
    const client = await deleteClient(validationResult.data, req.session.userId);

    if (!client) {
      return res.status(404).json({ message: "Le client est introuvable." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
