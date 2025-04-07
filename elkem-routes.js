const express = require('express');
const router = express.Router();
const {authenticateToken} = require('./token/jwtUtils.js');
const auth = require('./auth/authentication.js');
const standard = require('./standard/standard.js');
const authorizer = require('./authorized/authorized.js');
const admin = require('./admin/admin.js');
const elkem = require('./Elkem/user.js');


router.get('/organizationData/:organization_id',authenticateToken, admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id',authenticateToken, admin.plantsByOrganizationId);
router.get('/userStatisticsByOrganization/:organization_id',authenticateToken, admin.userStatisticsByOrganization);
router.get('/usersDataByOrganization/:organization_id',authenticateToken, admin.usersByOrganizationId);
router.get('/usersDataByPlant/:plant_id',authenticateToken, admin.userByPlantId);
router.get('/roles',authenticateToken, admin.userRoles);
router.post('/addForm',authenticateToken, admin.addFormData);
router.post('/addPlant/:organization_id',authenticateToken, admin.addPlantsInOrganization);
router.put('/updatePlant/:plant_id',authenticateToken, admin.updatePlantByPlantId);
router.delete('/deletePlant/:plant_id',authenticateToken, admin.deletePlantByPlantId);
router.get('/departmentsData/:plant_id',authenticateToken, admin.departmentsByPlantId);
router.get('/usersDataByDepartments/:department_id',authenticateToken,admin.userByDepartmentId);
router.post('/addDepartment/:plant_id',authenticateToken, admin.addDepartmentInPlants);
router.put('/updateDepartment/:department_id',authenticateToken, admin.updateDepartmentByDepartmentId);
router.delete('/deleteDepartment/:department_id',authenticateToken, admin.deleteDepartmentByDepartmentId);
router.delete('/deleteForm/:form_id',authenticateToken,admin.deleteFormByFormId);
router.post('/addCategory/:department_id',authenticateToken, admin.addCategory);
router.put('/updateCategory/:category_id',authenticateToken, admin.editCategory);
router.delete('/deleteCategory/:category_id',authenticateToken, admin.deleteCategoryByCategoryId);
router.get('/getAllFrequency',authenticateToken, admin.getAllFrequency);
router.get('/getAllModeration',authenticateToken, admin.getAllModeration);
router.post('/addFormToCategory',authenticateToken, admin.addFormToCategory);
router.get('/prevForms/:category_id',authenticateToken, admin.previousFormsByCategories);
router.get('/categoriesData/:department_id',authenticateToken,admin.CategoriesByDepartmentId);
router.get('/getAllIcons',authenticateToken, admin.getAllIcons);

router.post('/addUser',authenticateToken, admin.addUser);
router.put('/updateUser/:user_id',authenticateToken, admin.updateUser);
router.put('/updateUserFromAdmin/:user_id',authenticateToken, admin.updateUserFromAdmin);
router.delete('/deleteUser/:user_id',authenticateToken, admin.deleteUser);
router.get('/profileDetails/:user_id',authenticateToken, authorizer.getUserDetails);

router.put('/users/:user_id/block',authenticateToken, auth.toggleBlockStatus);
router.put('/users/:user_id/verified',authenticateToken, auth.toggleVerifiedStatus);

router.get('/getDepartmentsByOrganizationId/:organization_id',authenticateToken, admin.getDepartmentsByOrganizationId);
router.put('/updateUserFromAdmin/:user_id',authenticateToken,admin.updateUserFromAdmin);

router.get('/getPendingForms/:department_id',authenticateToken, elkem.getUnsubmittedForms);
router.get('/getFormCounts/:department_id',authenticateToken, elkem.getFormCounts);
router.get('/getAuthorizers/:department_id',authenticateToken, standard.getAuthorizersByDepartment);

router.get('/getFormById/:form_id',authenticateToken, elkem.getFormById);
router.get('/getUserSubmissions/:user_id/:interval',authenticateToken, elkem.getUserSubmissions);
router.get('/getSubmissionDetails/:submission_id',authenticateToken, elkem.getSubmissionData);
router.get('/getSubmissionDetailsAuth/:submission_id',authenticateToken, elkem.getSubmissionDataAuth);
router.post('/insertDetails',authenticateToken, standard.insertSubmissionDetails);
router.get('/getAuthorizerSubmissions/:user_id/:interval',authenticateToken, elkem.getAuthorizerSubmissions);

router.get('/getCategories/:department_id/:form_type',authenticateToken, standard.getCategories);
router.get('/getForms/:category_id',authenticateToken, standard.getForms);
router.get('/getQuestions/:form_id',authenticateToken, standard.getQuestions);
router.get('/getSubmissionCount/:form_type/:user_id',authenticateToken, standard.getSubmissionCount);
router.get('/profileDetails/:user_id',authenticateToken, authorizer.getUserDetails);
router.post('/signature',authenticateToken, authorizer.insertOrUpdateSignature);
router.put('/approveSubmission',authenticateToken, authorizer.approveSubmission);
router.put('/rejectSubmission',authenticateToken, authorizer.rejectSubmission);
router.post('/forgot',authenticateToken, auth.forgotPassword);
router.get('/profilePicture/:user_id',authenticateToken, auth.getProfilePicture);
router.get('/user',authenticateToken, auth.getUserDetails);
router.post('/login', auth.login);
router.post('/register',authenticateToken, auth.register);
router.post('/reset-password',authenticateToken, auth.resetPassword);
router.post('/resend-forgot',authenticateToken, auth.resendResetToken);
router.post('/tokens',authenticateToken, auth.getAllTokens);
router.put('/updateEmail/:user_id',authenticateToken, auth.updateEmail);
router.put('/updatePassword/:user_id',authenticateToken, auth.updatePassword);
router.put('/updateProfile',authenticateToken, auth.insertOrUpdateUserProfilePhoto);
router.put('/updateUser/:user_id',authenticateToken, auth.updateUser);

module.exports = router;
