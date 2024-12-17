const express = require('express');
const router = express.Router();

const auth = require('./auth/authentication.js');
const standard = require('./standard/standard.js');
const authorizer = require('./authorized/authorized.js');
const admin = require('./admin/admin.js');
const elkem = require('./Elkem/user.js');


router.get('/organizationData/:organization_id', admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id', admin.plantsByOrganizationId);
router.get('/userStatisticsByOrganization/:organization_id', admin.userStatisticsByOrganization);
router.get('/usersDataByOrganization/:organization_id', admin.usersByOrganizationId);


router.post('/addPlant/:organization_id', admin.addPlantsInOrganization);
router.put('/updatePlant/:plant_id', admin.updatePlantByPlantId);
router.delete('/deletePlant/:plant_id', admin.deletePlantByPlantId);
router.get('/departmentsData/:plant_id', admin.departmentsByPlantId);

router.post('/addDepartment/:plant_id', admin.addDepartmentInPlants);
router.put('/updateDepartment/:department_id', admin.updateDepartmentByDepartmentId);
router.delete('/deleteDepartment/:department_id', admin.deleteDepartmentByDepartmentId);

router.post('/addCategory/:department_id', admin.addCategory);
router.put('/updateCategory/:category_id', admin.editCategory);
router.delete('/deleteCategory/:category_id', admin.deleteCategoryByCategoryId);

router.post('/addFormToCategory', admin.addFormToCategory);
router.get('/prevForms/:category_id', admin.previousFormsByCategories);

router.get('/getAllIcons', admin.getAllIcons);

router.post('/addUser', admin.addUser);
router.put('/updateUser/:user_id', admin.updateUser);
router.put('/updateUserFromAdmin/:user_id', admin.updateUserFromAdmin);
router.delete('/deleteUser/:user_id', admin.deleteUser);
router.get('/profileDetails/:user_id', authorizer.getUserDetails);

router.put('/users/:user_id/block', auth.toggleBlockStatus);
router.put('/users/:user_id/verified', auth.toggleVerifiedStatus);

router.get('/getDepartmentsByOrganizationId/:organization_id', admin.getDepartmentsByOrganizationId);
router.put('/updateUserFromAdmin/:user_id',admin.updateUserFromAdmin);

router.get('/getPendingForms/:department_id', elkem.getUnsubmittedForms);
router.get('/getFormCounts/:department_id', elkem.getFormCounts);
router.get('/getAuthorizers/:department_id', standard.getAuthorizersByDepartment);

router.get('/getFormById/:form_id', elkem.getFormById);
router.get('/getUserSubmissions/:user_id/:interval', elkem.getUserSubmissions);
router.get('/getSubmissionDetails/:submission_id', elkem.getSubmissionData);
router.get('/getSubmissionDetailsAuth/:submission_id', elkem.getSubmissionDataAuth);
router.post('/insertDetails', standard.insertSubmissionDetails);
router.get('/getAuthorizerSubmissions/:user_id/:interval', elkem.getAuthorizerSubmissions);


router.get('/profileDetails/:user_id', authorizer.getUserDetails);
router.post('/signature', authorizer.insertOrUpdateSignature);
router.put('/approveSubmission', authorizer.approveSubmission);
router.put('/rejectSubmission', authorizer.rejectSubmission);

module.exports = router;
