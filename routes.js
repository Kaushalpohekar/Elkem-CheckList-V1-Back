const express = require('express');
const router = express.Router();
const {authenticateUser} = require('./token/jwtUtils.js');

// Import controllers
const auth = require('./auth/authentication.js');
const standard = require('./standard/standard.js');
const authorizer = require('./authorized/authorized.js');
const admin = require('./admin/admin.js');
const elkem = require('./Elkem/user.js');

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


// Standard
router.get('/getCategories/:department_id/:form_type',authenticateUser, standard.getCategories);
router.get('/getDepartments/:department_id',authenticateUser, standard.getDepartments);
router.get('/getForms/:category_id',authenticateUser, standard.getForms);
router.get('/getOrganizations/:organization_id',authenticateUser, standard.getOrganizations);
router.get('/getPlants/:plant_id',authenticateUser, standard.getPlants);
router.get('/getQuestions/:form_id',authenticateUser, standard.getQuestions);
router.get('/getSubmissionByInterval/:user_id/:interval',authenticateUser, standard.getUserSubmissions);

router.get('/getSubmissionCount/:form_type/:user_id',authenticateUser, standard.getSubmissionCount);

router.get('/getAuthorizers/:department_id',authenticateUser, standard.getAuthorizersByDepartment);
router.post('/createForms',authenticateUser, standard.createForms);
router.post('/createQuestions',authenticateUser, standard.createQuestions);
router.post('/insertCategories',authenticateUser, standard.insertCategories);
router.post('/insertDetails',authenticateUser, standard.insertSubmissionDetails);

// Authorizer
router.get('/getApprovedCounts/:user_id/:interval',authenticateUser, authorizer.getApprovedCounts);
router.get('/getFormTypeBar/:user_id/:interval',authenticateUser, authorizer.getFormTypeBar);
router.get('/getFormTypePercentages/:user_id/:interval',authenticateUser, authorizer.getFormTypePercentages);
router.get('/getStatusCounts/:user_id/:interval',authenticateUser, authorizer.getStatusCounts);
router.get('/getSubmissionByIntervalAuthorizer/:category_id/:user_id/:interval',authenticateUser, authorizer.getUserSubmissions);
router.get('/getSubmissionCountAuth/:form_type/:user_id',authenticateUser, authorizer.getSubmissionCount);
router.get('/profileDetails/:user_id',authenticateUser, authorizer.getUserDetails);
router.post('/signature',authenticateUser, authorizer.insertOrUpdateSignature);
router.put('/approveSubmission',authenticateUser, authorizer.approveSubmission);
router.put('/rejectSubmission',authenticateUser, authorizer.rejectSubmission);

// Admin
router.delete('/deleteDepartment/:department_id',authenticateUser, admin.deleteDepartmentByDepartmentId);
router.delete('/deletePlant/:plant_id',authenticateUser, admin.deletePlantByPlantId);
router.get('/categoriesData/:department_id',authenticateUser, admin.CategoriesByDepartmentId);
router.get('/departmentsData/:plant_id',authenticateUser, admin.departmentsByPlantId);
router.get('/organizationData/:organization_id',authenticateUser, admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id',authenticateUser, admin.plantsByOrganizationId);
router.get('/prevForms/:category_id',authenticateUser, admin.previousFormsByCategories);
router.get('/roles',authenticateUser, admin.userRoles);
router.get('/usersDataByDepartments/:department_id',authenticateUser, admin.userByDepartmentId);
router.get('/usersDataByPlant/:plant_id',authenticateUser, admin.userByPlantId);
router.get('/usersDataByOrganization/:organization_id',authenticateUser, admin.usersByOrganizationId);
router.post('/addDepartment/:plant_id',authenticateUser, admin.addDepartmentInPlants);
router.post('/addPlant/:organization_id',authenticateUser, admin.addPlantsInOrganization);
router.post('/addForm',authenticateUser, admin.addFormData);
router.put('/updateDepartment/:department_id',authenticateUser, admin.updateDepartmentByDepartmentId);
router.put('/updatePlant/:plant_id',authenticateUser, admin.updatePlantByPlantId);

router.delete('/deletePlant/:plant_id',authenticateUser, admin.deletePlantByPlantId);
router.delete('/deleteDepartment/:department_id',authenticateUser, admin.deleteDepartmentByDepartmentId);

//admin
router.get('/organizationData/:organization_id',authenticateUser,admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id',authenticateUser,admin.plantsByOrganizationId);
router.get('/departmentsData/:plant_id',authenticateUser,admin.departmentsByPlantId);
router.get('/usersDataByDepartments/:department_id',authenticateUser,admin.userByDepartmentId);
router.get('/usersDataByOrganization/:organization_id',authenticateUser,admin.usersByOrganizationId);
router.get('/categoriesData/:department_id',authenticateUser,admin.CategoriesByDepartmentId);
router.get('/prevForms/:category_id',authenticateUser,admin.previousFormsByCategories);
router.get('/formData/:form_id',authenticateUser,admin.FormByFormId);
router.get('/roles',authenticateUser,admin.userRoles);

router.post('/addPlant/:organization_id',authenticateUser,admin.addPlantsInOrganization);
router.post('/addDepartment/:plant_id',authenticateUser,admin.addDepartmentInPlants);
router.post('/addUser',authenticateUser,admin.addUser);
router.post('/addCategory/:department_id',authenticateUser,admin.addCategory);

router.put('/updatePlant/:plant_id',authenticateUser,admin.updatePlantByPlantId);
router.put('/updateDepartment/:department_id',authenticateUser,admin.updateDepartmentByDepartmentId);
router.put('/updateUser/:user_id',authenticateUser,admin.updateUser);

router.delete('/deletePlant/:plant_id',authenticateUser,admin.deletePlantByPlantId);
router.delete('/deleteForm/:form_id',authenticateUser,admin.deleteFormByFormId);
router.delete('/deleteUser/:user_id',authenticateUser,admin.deleteUser);
router.delete('/deleteDepartment/:department_id',authenticateUser,admin.deleteDepartmentByDepartmentId);

router.post('/addForm',authenticateUser,admin.addFormData);
router.get('/getAllIcons',authenticateUser, admin.getAllIcons);
router.put('/updateCategory/:category_id',authenticateUser,admin.editCategory);
router.delete('/deleteCategory/:category_id',authenticateUser,admin.deleteCategoryByCategoryId);
router.get('/userStatisticsByOrganization/:organization_id',authenticateUser, admin.userStatisticsByOrganization);

router.get('/getAllModeration',authenticateUser, admin.getAllModeration);
router.get('/getAllFrequency',authenticateUser, admin.getAllFrequency);
router.post('/addFormToCategory',authenticateUser,admin.addFormToCategory);
router.get('/prevForms/:category_id',authenticateUser,admin.previousFormsByCategories);
// router.put('/users/:User_id/block', auth.block);

router.put('/users/:user_id/block',authenticateUser, auth.toggleBlockStatus);
router.put('/users/:user_id/verified',authenticateUser, auth.toggleVerifiedStatus);

router.get('/getPendingForms/:department_id',authenticateUser, elkem.getUnsubmittedForms);
router.get('/getFormCounts/:department_id',authenticateUser, elkem.getFormCounts);

router.get('/getDepartmentsByOrganizationId/:organization_id',authenticateUser, admin.getDepartmentsByOrganizationId);
router.put('/updateUserFromAdmin/:user_id',authenticateUser,admin.updateUserFromAdmin);

router.get('/getFormById/:form_id',authenticateUser, elkem.getFormById);
router.get('/getUserSubmissions/:user_id/:interval',authenticateUser, elkem.getUserSubmissions);
router.get('/getSubmissionDetails/:submission_id',authenticateUser, elkem.getSubmissionData);


router.get('/getAuthorizerSubmissions/:user_id/:interval',authenticateUser, elkem.getAuthorizerSubmissions);

router.get('/getSubmissionDetailsAuth/:submission_id',authenticateUser, elkem.getSubmissionDataAuth);
module.exports=router;
