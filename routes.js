const express = require('express');
const router = express.Router();

// Import controllers
const auth = require('./auth/authentication.js');
const standard = require('./standard/standard.js');
const authorizer = require('./authorized/authorized.js');
const admin = require('./admin/admin.js');

// Authentication
router.post('/forgot', auth.forgotPassword);
router.get('/profilePicture/:user_id', auth.getProfilePicture);
router.get('/user', auth.getUserDetails);
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/reset-password', auth.resetPassword);
router.post('/resend-forgot', auth.resendResetToken);
router.post('/tokens', auth.getAllTokens);
router.put('/updateEmail/:user_id', auth.updateEmail);
router.put('/updatePassword/:user_id', auth.updatePassword);
router.put('/updateProfile', auth.insertOrUpdateUserProfilePhoto);
router.put('/updateUser/:user_id', auth.updateUser);
router.put('/users/:User_id/block', auth.block);

// Standard
router.get('/getCategories/:department_id/:form_type', standard.getCategories);
router.get('/getDepartments/:department_id', standard.getDepartments);
router.get('/getForms/:category_id', standard.getForms);
router.get('/getOrganizations/:organization_id', standard.getOrganizations);
router.get('/getPlants/:plant_id', standard.getPlants);
router.get('/getQuestions/:form_id', standard.getQuestions);
router.get('/getSubmissionByInterval/:user_id/:interval', standard.getUserSubmissions);
router.get('/getSubmissionByIntervalCount/:user_id/:interval', standard.getUserSubmissionStatusCounts);
router.get('/getSubmissionCount/:form_type/:user_id', standard.getSubmissionCount);
router.get('/getSubmissionDetails/:submission_id', standard.getSubmissionDetails);
router.get('/getAuthorizers/:department_id', standard.getAuthorizersByDepartment);
router.post('/createForms', standard.createForms);
router.post('/createQuestions', standard.createQuestions);
router.post('/insertCategories', standard.insertCategories);
router.post('/insertDetails', standard.insertSubmissionDetails);

// Authorizer
router.get('/getApprovedCounts/:user_id/:interval', authorizer.getApprovedCounts);
router.get('/getFormTypeBar/:user_id/:interval', authorizer.getFormTypeBar);
router.get('/getFormTypePercentages/:user_id/:interval', authorizer.getFormTypePercentages);
router.get('/getStatusCounts/:user_id/:interval', authorizer.getStatusCounts);
router.get('/getSubmissionByIntervalAuthorizer/:category_id/:user_id/:interval', authorizer.getUserSubmissions);
router.get('/getSubmissionCountAuth/:form_type/:user_id', authorizer.getSubmissionCount);
router.get('/profileDetails/:user_id', authorizer.getUserDetails);
router.post('/signature', authorizer.insertOrUpdateSignature);
router.put('/approveSubmission', authorizer.approveSubmission);
router.put('/rejectSubmission', authorizer.rejectSubmission);

// Admin
router.delete('/deleteDepartment/:department_id', admin.deleteDepartmentByDepartmentId);
router.delete('/deletePlant/:plant_id', admin.deletePlantByPlantId);
router.get('/categoriesData/:department_id', admin.CategoriesByDepartmentId);
router.get('/departmentsData/:plant_id', admin.departmentsByPlantId);
router.get('/organizationData/:organization_id', admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id', admin.plantsByOrganizationId);
router.get('/prevForms/:category_id', admin.previousFormsByCategories);
router.get('/roles', admin.userRoles);
router.get('/usersDataByDepartments/:department_id', admin.userByDepartmentId);
router.get('/usersDataByPlant/:plant_id', admin.userByPlantId);
router.get('/usersDataByOrganization/:organization_id', admin.usersByOrganizationId);
router.post('/addDepartment/:plant_id', admin.addDepartmentInPlants);
router.post('/addPlant/:organization_id', admin.addPlantsInOrganization);
router.post('/addForm', admin.addFormData);
router.put('/updateDepartment/:department_id', admin.updateDepartmentByDepartmentId);
router.put('/updatePlant/:plant_id', admin.updatePlantByPlantId);

router.delete('/deletePlant/:plant_id', admin.deletePlantByPlantId);
router.delete('/deleteDepartment/:department_id', admin.deleteDepartmentByDepartmentId);

//admin
router.get('/organizationData/:organization_id',admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id',admin.plantsByOrganizationId);
router.get('/departmentsData/:plant_id',admin.departmentsByPlantId);
router.get('/usersDataByDepartments/:department_id',admin.userByDepartmentId);
router.get('/usersDataByOrganization/:organization_id',admin.usersByOrganizationId);
router.get('/categoriesData/:department_id',admin.CategoriesByDepartmentId);
router.get('/prevForms/:category_id',admin.previousFormsByCategories);
router.get('/formData/:form_id',admin.FormByFormId);
router.get('/roles',admin.userRoles);

router.post('/addPlant/:organization_id',admin.addPlantsInOrganization);
router.post('/addDepartment/:plant_id',admin.addDepartmentInPlants);
router.post('/addUser',admin.addUser);
router.post('/addCategory/:department_id',admin.addCategory);

router.put('/updatePlant/:plant_id',admin.updatePlantByPlantId);
router.put('/updateDepartment/:department_id',admin.updateDepartmentByDepartmentId);
router.put('/updateUser/:user_id',admin.updateUser);

router.delete('/deletePlant/:plant_id',admin.deletePlantByPlantId);
router.delete('/deleteForm/:form_id',admin.deleteFormByFormId);
router.delete('/deleteUser/:user_id',admin.deleteUser);
router.delete('/deleteDepartment/:department_id',admin.deleteDepartmentByDepartmentId);

router.post('/addForm',admin.addFormData);
router.get('/getAllIcons', admin.getAllIcons);
router.put('/updateCategory/:category_id',admin.editCategory);
router.delete('/deleteCategory/:category_id',admin.deleteCategoryByCategoryId);
router.get('/userStatisticsByOrganization/:organization_id', admin.userStatisticsByOrganization);
router.put('/updateUserFromAdmin/:user_id',admin.updateUserFromAdmin);
router.get('/getAllModeration', admin.getAllModeration);
router.get('/getAllFrequency', admin.getAllFrequency);
router.post('/addFormToCategory',admin.addFormToCategory);

module.exports=router;
