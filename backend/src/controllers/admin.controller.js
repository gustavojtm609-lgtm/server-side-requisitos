import * as adminService from '../services/admin.service.js';

function sendData(response, data, status = 200) {
  response.status(status).json({ success: true, data });
}

export async function listThemes(request, response) {
  sendData(response, await adminService.listThemes(request.validated.query));
}

export async function getTheme(request, response) {
  sendData(response, await adminService.getTheme(request.validated.params.id));
}

export async function createTheme(request, response) {
  sendData(response, await adminService.createTheme(request.validated.body), 201);
}

export async function updateTheme(request, response) {
  sendData(
    response,
    await adminService.updateTheme(request.validated.params.id, request.validated.body),
  );
}

export async function archiveTheme(request, response) {
  await adminService.archiveTheme(request.validated.params.id);
  response.status(204).end();
}

export async function listModalities(request, response) {
  sendData(response, await adminService.listModalities(request.validated.query));
}

export async function getModality(request, response) {
  sendData(response, await adminService.getModality(request.validated.params.id));
}

export async function createModality(request, response) {
  sendData(response, await adminService.createModality(request.validated.body), 201);
}

export async function updateModality(request, response) {
  sendData(
    response,
    await adminService.updateModality(
      request.validated.params.id,
      request.validated.body,
    ),
  );
}

export async function archiveModality(request, response) {
  await adminService.archiveModality(request.validated.params.id);
  response.status(204).end();
}

export async function listPhases(request, response) {
  sendData(response, await adminService.listPhases(request.validated.query));
}

export async function getPhase(request, response) {
  sendData(response, await adminService.getPhase(request.validated.params.id));
}

export async function createPhase(request, response) {
  sendData(response, await adminService.createPhase(request.validated.body), 201);
}

export async function updatePhase(request, response) {
  sendData(
    response,
    await adminService.updatePhase(request.validated.params.id, request.validated.body),
  );
}

export async function archivePhase(request, response) {
  await adminService.archivePhase(request.validated.params.id);
  response.status(204).end();
}

export async function listQuestions(request, response) {
  sendData(response, await adminService.listQuestions(request.validated.query));
}

export async function getQuestion(request, response) {
  sendData(response, await adminService.getQuestion(request.validated.params.id));
}

export async function createQuestion(request, response) {
  sendData(
    response,
    await adminService.createQuestion(request.validated.body, request.auth.userId),
    201,
  );
}

export async function updateQuestion(request, response) {
  sendData(
    response,
    await adminService.updateQuestion(
      request.validated.params.id,
      request.validated.body,
      request.auth.userId,
    ),
  );
}

export async function updateQuestionAlternatives(request, response) {
  sendData(
    response,
    await adminService.updateQuestionAlternatives(
      request.validated.params.id,
      request.validated.body.correctType,
    ),
  );
}

export async function archiveQuestion(request, response) {
  await adminService.archiveQuestion(request.validated.params.id);
  response.status(204).end();
}

export async function listUsers(request, response) {
  sendData(response, await adminService.listUsers(request.validated.query));
}

export async function updateUser(request, response) {
  sendData(
    response,
    await adminService.updateUser(
      request.auth.userId,
      request.validated.params.id,
      request.validated.body,
    ),
  );
}
