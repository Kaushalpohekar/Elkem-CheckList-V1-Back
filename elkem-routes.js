const express = require('express');
const router = express.Router();

// Import controllers
const auth = require('./auth/authentication.js');
const standard = require('./standard/standard.js');
const authorizer = require('./authorized/authorized.js');
const admin = require('./admin/admin.js');

router.get('/organizationData/:organization_id',admin.organizationByOrganizationId);
router.get('/plantsData/:organization_id', admin.plantsByOrganizationId);
router.get('/profileDetails/:user_id', authorizer.getUserDetails);
router.put('/updatePlant/:plant_id', admin.updatePlantByPlantId);
router.delete('/deletePlant/:plant_id', admin.deletePlantByPlantId);
router.post('/addPlant/:organization_id', admin.addPlantsInOrganization);
router.get('/departmentsData/:plant_id', admin.departmentsByPlantId);
router.post('/addDepartment/:plant_id',admin.addDepartmentInPlants);
router.put('/updateDepartment/:department_id', admin.updateDepartmentByDepartmentId);
router.delete('/deleteDepartment/:department_id', admin.deleteDepartmentByDepartmentId);
router.post('/addCategory/:department_id',admin.addCategory);
router.get('/getAllIcons', admin.getAllIcons);
router.put('/updateCategory/:category_id',admin.editCategory);
router.delete('/deleteCategory/:category_id',admin.deleteCategoryByCategoryId);
router.get('/userStatisticsByOrganization/:organization_id', admin.userStatisticsByOrganization);
router.put('/updateUser/:user_id',admin.updateUser);
router.post('/addUser',admin.addUser);
router.delete('/deleteUser/:user_id',admin.deleteUser);
router.put('/updateUserFromAdmin/:user_id',admin.updateUserFromAdmin);
router.post('/addFormToCategory',admin.addFormToCategory);
module.exports=router;
