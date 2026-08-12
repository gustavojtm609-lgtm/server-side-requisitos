import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  contentListSchema,
  createModalitySchema,
  createPhaseSchema,
  createQuestionSchema,
  createThemeSchema,
  idSchema,
  phaseListSchema,
  questionListSchema,
  updateAlternativesSchema,
  updateModalitySchema,
  updatePhaseSchema,
  updateQuestionSchema,
  updateThemeSchema,
  updateUserSchema,
  userListSchema,
} from '../validators/admin.validator.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router
  .route('/themes')
  .get(validate(contentListSchema), asyncHandler(adminController.listThemes))
  .post(validate(createThemeSchema), asyncHandler(adminController.createTheme));
router
  .route('/themes/:id')
  .get(validate(idSchema), asyncHandler(adminController.getTheme))
  .patch(validate(updateThemeSchema), asyncHandler(adminController.updateTheme))
  .delete(validate(idSchema), asyncHandler(adminController.archiveTheme));

router
  .route('/modalities')
  .get(validate(contentListSchema), asyncHandler(adminController.listModalities))
  .post(
    validate(createModalitySchema),
    asyncHandler(adminController.createModality),
  );
router
  .route('/modalities/:id')
  .get(validate(idSchema), asyncHandler(adminController.getModality))
  .patch(
    validate(updateModalitySchema),
    asyncHandler(adminController.updateModality),
  )
  .delete(validate(idSchema), asyncHandler(adminController.archiveModality));

router
  .route('/phases')
  .get(validate(phaseListSchema), asyncHandler(adminController.listPhases))
  .post(validate(createPhaseSchema), asyncHandler(adminController.createPhase));
router
  .route('/phases/:id')
  .get(validate(idSchema), asyncHandler(adminController.getPhase))
  .patch(validate(updatePhaseSchema), asyncHandler(adminController.updatePhase))
  .delete(validate(idSchema), asyncHandler(adminController.archivePhase));

router
  .route('/questions')
  .get(validate(questionListSchema), asyncHandler(adminController.listQuestions))
  .post(
    validate(createQuestionSchema),
    asyncHandler(adminController.createQuestion),
  );
router.put(
  '/questions/:id/alternatives',
  validate(updateAlternativesSchema),
  asyncHandler(adminController.updateQuestionAlternatives),
);
router
  .route('/questions/:id')
  .get(validate(idSchema), asyncHandler(adminController.getQuestion))
  .patch(
    validate(updateQuestionSchema),
    asyncHandler(adminController.updateQuestion),
  )
  .delete(validate(idSchema), asyncHandler(adminController.archiveQuestion));

router.get(
  '/users',
  validate(userListSchema),
  asyncHandler(adminController.listUsers),
);
router.patch(
  '/users/:id',
  validate(updateUserSchema),
  asyncHandler(adminController.updateUser),
);

export default router;
