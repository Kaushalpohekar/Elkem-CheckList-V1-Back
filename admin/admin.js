const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

function sanitizeInput(input) {
    return input.replace(/[^\w\s.-]/gi, '');
}

async function organizationByOrganizationId(req, res) {
    const { organization_id } = req.params;
    const query = `SELECT * FROM elkem.organizations WHERE organization_id = $1`;
    try {
        const result = await db.query(query, [organization_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function FormByFormId(req, res) {
    const { form_id } = req.params;

    const client = await db.connect();

    try {
        const queryForm = `
        SELECT *
        FROM elkem.forms WHERE form_id = $1`;
        const valuesForm = [form_id];
        const resultForm = await client.query(queryForm, valuesForm);

        if (resultForm.rows.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = resultForm.rows[0];

        const queryQuestions = `
        SELECT *
        FROM elkem.questions WHERE form_id = $1`;
        const valuesQuestions = [form_id];
        const resultQuestions = await client.query(queryQuestions, valuesQuestions);

        const questions = resultQuestions.rows;

        for (const question of questions) {
            const queryOptions = `
            SELECT *
            FROM elkem.options WHERE question_id = $1`;
            const valuesOptions = [question.question_id];
            const resultOptions = await client.query(queryOptions, valuesOptions);

            question.options = resultOptions.rows;
        }

        form.questions = questions;

        res.status(200).json(form);
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}

async function plantsByOrganizationId(req, res) {
    const { organization_id } = req.params;
    const query = `SELECT * FROM elkem.plants WHERE organization_id = $1`;
    try {
        const result = await db.query(query, [organization_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plants not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function departmentsByPlantId(req, res) {
    const { plant_id } = req.params;
    // const query = `
    //     SELECT d.department_id, d.name, d.plant_id, d.created_at as create_time, COUNT(u.user_id) AS total_users
    //     FROM elkem.departments d
    //     LEFT JOIN elkem.users u ON d.plant_id = u.plant_id
    //     WHERE d.plant_id = $1
    //     GROUP BY d.department_id, d.name, d.plant_id;
    // `;
    const query = `
        SELECT d.department_id, d.name, d.plant_id, d.created_at as create_time, COUNT(c.category_id) AS total_categories
        FROM elkem.departments d
        LEFT JOIN elkem.categories c ON d.department_id = c.department_id
        WHERE d.plant_id = $1
        GROUP BY d.department_id, d.name, d.plant_id;
    `;

    try {
        const result = await db.query(query, [plant_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Departments not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function userByDepartmentId(req, res) {
    const { department_id } = req.params;
    const query = `
        SELECT u.*, r.name as role_name
        FROM elkem.users u
        JOIN elkem.roles r ON u.role_id = r.role_id
        WHERE u.department_id = $1`;
    try {
        const result = await db.query(query, [department_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No User Found for Selected Department' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function userByPlantId(req, res) {
    const { plant_id } = req.params;
    const query = `
        SELECT u.*, r.name as role_name
        FROM elkem.users u
        JOIN elkem.roles r ON u.role_id = r.role_id
        WHERE u.plant_id = $1`;
    try {
        const result = await db.query(query, [plant_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No User Found for Selected Plant' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function usersByOrganizationId(req, res) {
    const { organization_id } = req.params;
    //const query = `SELECT * FROM elkem.users WHERE organization_id = $1`;
    const query = `
        SELECT u.*, r.name as role_name, p.name as plant_name, d.name as department_name
        FROM elkem.users u
        JOIN elkem.roles r ON u.role_id = r.role_id
        JOIN elkem.plants p ON u.plant_id  = p.plant_id
        JOIN elkem.departments d ON u.department_id = d.department_id         
        WHERE u.organization_id =$1
        AND u.deleted = false`;

    try {
        const result = await db.query(query, [organization_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Users not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function CategoriesByDepartmentId(req, res) {
    const { department_id } = req.params;
    const query = `SELECT * FROM elkem.categories WHERE department_id = $1`;
    try {
        const result = await db.query(query, [department_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categories not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// async function previousFormsByCategories(req, res) {
//     const { category_id } = req.params;
//     const query = `SELECT * FROM elkem.forms WHERE category_id = $1`;
//     try {
//         const result = await db.query(query, [category_id]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Forms not found' });
//         }
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

async function addPlantsInOrganization(req, res) {
    const { organization_id } = req.params;
    const { name, location } = req.body;
    const plant_id = uuidv4();
    const created_at = new Date().toISOString();  // Current date and time in ISO 8601 format

    const queryOne = `SELECT 1 FROM elkem.organizations WHERE organization_id = $1`;
    const queryTwo = `
        INSERT INTO elkem.plants (plant_id, organization_id, name, location, created_at) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING plant_id`;

    try {
        const resultOne = await db.query(queryOne, [organization_id]);
        if (resultOne.rowCount === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const resultTwo = await db.query(queryTwo, [plant_id, organization_id, name, location, created_at]);
        const newPlantId = resultTwo.rows[0].plant_id;

        return res.status(201).json({ plant_id: newPlantId });
    } catch (error) {
        console.error('Error adding plant:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addDepartmentInPlants(req, res) {
    const { plant_id } = req.params;
    const { name } = req.body;
    const department_id = uuidv4();
    const created_at = new Date().toISOString();  // Current date and time in ISO 8601 format

    const queryOne = `SELECT 1 FROM elkem.plants WHERE plant_id = $1`;
    const queryTwo = `
        INSERT INTO elkem.departments (department_id , plant_id, name, created_at) 
        VALUES ($1, $2, $3, $4)
        RETURNING department_id`;

    try {
        const resultOne = await db.query(queryOne, [plant_id]);
        if (resultOne.rowCount === 0) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        const resultTwo = await db.query(queryTwo, [department_id, plant_id, name, created_at]);
        const newDepartmentId = resultTwo.rows[0].department_id;

        return res.status(201).json({ department_id: newDepartmentId });
    } catch (error) {
        console.error('Error adding Department:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addCategory(req, res) {
    const { department_id } = req.params;
    const { name, icon, subtitle } = req.body;
    const category_id = uuidv4();
    const created_at = new Date().toISOString();  // Current date and time in ISO 8601 format

    const query = `
        INSERT INTO elkem.categories (category_id, created_at, department_id, name, icon, subtitle) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING category_id`;

    try {
        const result = await db.query(query, [category_id, created_at, department_id, name, icon, subtitle]);
        const newCategoryId = result.rows[0].category_id;

        return res.status(201).json({ category_id: newCategoryId });
    } catch (error) {
        console.error('Error adding Category:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updatePlantByPlantId(req, res) {
    const { plant_id } = req.params;
    const { name, location } = req.body;

    const queryUpdate = `
        UPDATE elkem.plants 
        SET name = $2, location = $3 
        WHERE plant_id = $1 
        RETURNING plant_id, name, location, organization_id, created_at`;

    try {
        const resultUpdate = await db.query(queryUpdate, [plant_id, name, location]);
        const updatedPlant = resultUpdate.rows[0];

        if (!updatedPlant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        return res.status(200).json(updatedPlant);
    } catch (error) {
        console.error('Error updating plant:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addFormData(req, res) {
    const { form_name, form_description, created_by, category_id, plant_id, Questions } = req.body;

    const form_id = uuidv4();
    const created_at = new Date().toISOString();

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Insert into forms table
        const queryForm = `
      INSERT INTO elkem.forms (form_id, form_name, form_description, created_by, category_id, plant_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING form_id`;
        const valuesForm = [form_id, form_name, form_description, created_by, category_id, plant_id, created_at];

        const resultForm = await client.query(queryForm, valuesForm);
        const newFormId = resultForm.rows[0].form_id;

        // Insert into questions table
        for (const question of Questions) {
            const question_id = uuidv4();
            const { Question, QuestionType } = question;
            const created_at_question = new Date().toISOString();

            const queryQuestion = `
        INSERT INTO elkem.questions (question_id, question_text, question_type, form_id, created_at)
        VALUES ($1, $2, $3, $4, $5)`;
            const valuesQuestion = [question_id, Question, QuestionType, newFormId, created_at_question];

            await client.query(queryQuestion, valuesQuestion);

            // Insert into options table if Option exists
            if (question.Option) {
                const options = question.Option.split(',').map(option => option.trim());
                for (const option of options) {
                    const option_id = uuidv4();
                    const created_at_option = new Date().toISOString();

                    const queryOption = `
            INSERT INTO elkem.options (option_id, option_text, question_id, created_at)
            VALUES ($1, $2, $3, $4)`;
                    const valuesOption = [option_id, option, question_id, created_at_option];

                    await client.query(queryOption, valuesOption);
                }
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ form_id: newFormId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding form data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}

async function userRoles(req, res) {
    const query = `SELECT * FROM elkem.roles WHERE name != 'SuperAdmin';`;
    try {
        const data = await db.query(query);
        const newdata = data.rows;

        if (!newdata) {
            return res.status(404).json({ error: 'Data not found' });
        }

        return res.status(200).json(newdata);
    } catch (error) {
        console.error('Error getting Data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateDepartmentByDepartmentId(req, res) {
    const { department_id } = req.params;
    const { name } = req.body;

    const queryUpdate = `
        UPDATE elkem.departments 
        SET name = $2
        WHERE department_id = $1 
        RETURNING department_id ,plant_id, name, created_at`;

    try {
        const resultUpdate = await db.query(queryUpdate, [department_id, name]);
        const updatedDepartment = resultUpdate.rows[0];

        if (!updatedDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }

        return res.status(200).json(updatedDepartment);
    } catch (error) {
        console.error('Error updating department:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deletePlantByPlantId(req, res) {
    const { plant_id } = req.params;

    const queryDelete = `
        DELETE FROM elkem.plants 
        WHERE plant_id = $1 
        RETURNING plant_id`;

    try {
        const resultDelete = await db.query(queryDelete, [plant_id]);
        const deletedPlant = resultDelete.rows[0];

        if (!deletedPlant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        return res.status(200).json({ message: 'Plant deleted successfully', plant_id: deletedPlant.plant_id });
    } catch (error) {
        console.error('Error deleting plant:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteFormByFormId(req, res) {
    const { form_id } = req.params;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const deleteOptionsQuery = `
      DELETE FROM elkem.options
      WHERE question_id IN (
        SELECT question_id
        FROM elkem.questions
        WHERE form_id = $1
      )`;
        await client.query(deleteOptionsQuery, [form_id]);

        const deleteQuestionsQuery = `
      DELETE FROM elkem.questions
      WHERE form_id = $1`;
        await client.query(deleteQuestionsQuery, [form_id]);

        const deleteFormQuery = `
      DELETE FROM elkem.forms
      WHERE form_id = $1`;
        await client.query(deleteFormQuery, [form_id]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}

// async function deleteUser(req, res) {
//     const { user_id } = req.params;

//     const queryDelete = `
//         DELETE FROM elkem.users 
//         WHERE user_id = $1 
//         RETURNING user_id`;

//     try {
//         const resultDelete = await db.query(queryDelete, [user_id]);
//         const deletedUser = resultDelete.rows[0];

//         if (!deletedUser) {
//             return res.status(404).json({ error: 'user not found' });
//         }

//         return res.status(200).json({ message: 'User deleted successfully', User_id: deletedUser.user_id });
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

async function deleteDepartmentByDepartmentId(req, res) {
    const { department_id } = req.params;

    const queryDelete = `
        DELETE FROM elkem.departments 
        WHERE department_id = $1 
        RETURNING department_id`;

    try {
        const resultDelete = await db.query(queryDelete, [department_id]);
        const deletedDepartment = resultDelete.rows[0];

        if (!deletedDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }

        return res.status(200).json({ message: 'Department deleted successfully', department_id: deletedDepartment.department_id });
    } catch (error) {
        console.error('Error deleting department:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// async function addUser(req, res) {
//     const { personal_email, first_name, last_name, role_id, plant_id, contact_no, password } = req.body;

//     if (!personal_email || !first_name || !last_name || !role_id || !plant_id || !contact_no || !password) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     const user_id = uuidv4();
//     const created_at = new Date().toISOString();
//     const verified = false;
//     const block = false;
//     const username = personal_email;

//     try {
//         const password_hash = await bcrypt.hash(password, 10);

//         // Query to find organization_id using plant_id
//         const queryPlant = `SELECT organization_id FROM elkem.plants WHERE plant_id = $1`;
//         const resultPlant = await db.query(queryPlant, [plant_id]);

//         if (resultPlant.rows.length === 0) {
//             return res.status(404).json({ error: 'Plant not found' });
//         }

//         const organization_id = resultPlant.rows[0].organization_id;

//         // Query to check if the user exists with the provided email and is deleted
//         const queryUserCheck = `
//             SELECT user_id, deleted FROM elkem.users WHERE personal_email = $1`;
//         const resultUserCheck = await db.query(queryUserCheck, [personal_email]);

//         if (resultUserCheck.rows.length > 0) {
//             const existingUser = resultUserCheck.rows[0];

//             if (existingUser.deleted) {
//                 // If the user is marked as deleted, update the user with new data
//                 const queryUpdate = `
//                     UPDATE elkem.users 
//                     SET 
//                         user_id = $1,
//                         username = $2,
//                         personal_email = $3,
//                         password_hash = $4,
//                         first_name = $5,
//                         last_name = $6,
//                         role_id = $7,
//                         organization_id = $8,
//                         plant_id = $9,
//                         created_at = $10,
//                         verified = $11,
//                         block = $12,
//                         contact_no = $13,
//                         deleted = $14
//                     WHERE user_id = $15
//                     RETURNING user_id`;

//                 const valuesUpdate = [user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, created_at, verified, block, contact_no, false, existingUser.user_id];

//                 const resultUpdate = await db.query(queryUpdate, valuesUpdate);
//                 const updatedUser = resultUpdate.rows[0];

//                 if (!updatedUser) {
//                     return res.status(500).json({ error: 'User could not be updated' });
//                 }

//                 return res.status(200).json(updatedUser);
//             } else {
//                 // If the user is not deleted, return an error that the user already exists
//                 return res.status(400).json({ error: 'User already exists and is not deleted' });
//             }
//         }

//         // If the user doesn't exist, proceed with inserting a new user
//         const queryInsert = `
//             INSERT INTO elkem.users (user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, created_at, company_email, verified, block, contact_no) 
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
//             RETURNING user_id`;

//         const valuesInsert = [user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, created_at, personal_email, verified, block, contact_no];

//         const resultInsert = await db.query(queryInsert, valuesInsert);
//         const newUser = resultInsert.rows[0];

//         if (!newUser) {
//             return res.status(500).json({ error: 'User could not be added' });
//         }

//         return res.status(201).json(newUser);
//     } catch (error) {
//         console.error('Error adding user:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
async function addUser(req, res) {
    const { personal_email, first_name, last_name, role_id, plant_id, contact_no, password, department_id } = req.body;

    if (!personal_email || !first_name || !last_name || !role_id || !plant_id || !contact_no || !password || !department_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const user_id = uuidv4();
    const created_at = new Date().toISOString();
    const verified = false;
    const block = false;
    const username = personal_email;

    try {
        const password_hash = await bcrypt.hash(password, 10);

        // Query to find organization_id using plant_id
        const queryPlant = `SELECT organization_id FROM elkem.plants WHERE plant_id = $1`;
        const resultPlant = await db.query(queryPlant, [plant_id]);

        if (resultPlant.rows.length === 0) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        const organization_id = resultPlant.rows[0].organization_id;

        // Query to check if the user exists with the provided email and is deleted
        const queryUserCheck = `SELECT user_id, deleted FROM elkem.users WHERE personal_email = $1`;
        const resultUserCheck = await db.query(queryUserCheck, [personal_email]);

        if (resultUserCheck.rows.length > 0) {
            const existingUser = resultUserCheck.rows[0];

            if (existingUser.deleted) {
                // If the user is marked as deleted, update the user with new data
                const queryUpdate = `
                    UPDATE elkem.users 
                    SET 
                        user_id = $1,
                        username = $2,
                        personal_email = $3,
                        password_hash = $4,
                        first_name = $5,
                        last_name = $6,
                        role_id = $7,
                        organization_id = $8,
                        plant_id = $9,
                        department_id = $10,
                        created_at = $11,
                        verified = $12,
                        block = $13,
                        contact_no = $14,
                        deleted = $15
                    WHERE user_id = $16
                    RETURNING user_id`;

                const valuesUpdate = [user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, department_id, created_at, verified, block, contact_no, false, existingUser.user_id];

                const resultUpdate = await db.query(queryUpdate, valuesUpdate);
                const updatedUser = resultUpdate.rows[0];

                if (!updatedUser) {
                    return res.status(500).json({ error: 'User could not be updated' });
                }

                return res.status(200).json(updatedUser);
            } else {
                // If the user is not deleted, return an error that the user already exists
                return res.status(400).json({ error: 'User already exists and is not deleted' });
            }
        }

        // If the user doesn't exist, proceed with inserting a new user
        const queryInsert = `
            INSERT INTO elkem.users (user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, department_id, created_at, company_email, verified, block, contact_no) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING user_id`;

        const valuesInsert = [user_id, username, personal_email, password_hash, first_name, last_name, role_id, organization_id, plant_id, department_id, created_at, personal_email, verified, block, contact_no];

        const resultInsert = await db.query(queryInsert, valuesInsert);
        const newUser = resultInsert.rows[0];

        if (!newUser) {
            return res.status(500).json({ error: 'User could not be added' });
        }

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function updateUser(req, res) {
    const { user_id } = req.params; // Extract user_id from URL parameters
    const { personal_email, first_name, last_name, role_id, plant_id, contact_no, department_id } = req.body;

    if (!user_id || !personal_email || !first_name || !last_name || !role_id || !plant_id || !contact_no || !department_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const username = personal_email;

    try {
        // Update query for users table, now including department_id
        const queryUpdate = `
            UPDATE elkem.users
            SET 
                username = $2,
                personal_email = $3,
                first_name = $4,
                last_name = $5,
                role_id = $6,
                plant_id = $7,
                department_id = $8,
                contact_no = $9
            WHERE user_id = $1
            RETURNING user_id`;

        const values = [user_id, username, personal_email, first_name, last_name, role_id, plant_id, department_id, contact_no];

        const resultUpdate = await db.query(queryUpdate, values);
        const updatedUser = resultUpdate.rows[0];

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}




async function getAllIcons(req, res) {
    try {
        const queryFetchIcons = `
            SELECT material_icon_name AS material, serial as arrange
            FROM elkem.icon_mapping
        `;

        const result = await db.query(queryFetchIcons);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No icons found' });
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching icons:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function editCategory(req, res) {
    const { category_id } = req.params;
    const { name, icon, subtitle, department_id } = req.body;
    let query = `
        UPDATE elkem.categories
        SET 
            name = $1, 
            icon = $2, 
            subtitle = $3, 
            department_id = $4
        WHERE category_id = $5
        RETURNING category_id`;

    const values = [name, icon, subtitle, department_id, category_id];

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        return res.status(200).json({ category_id: result.rows[0].category_id });
    } catch (error) {
        console.error('Error editing Category:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function deleteCategoryByCategoryId(req, res) {
    const { category_id } = req.params;

    const queryDelete = `
        DELETE FROM elkem.categories 
        WHERE category_id = $1 
        RETURNING category_id`;

    try {
        const resultDelete = await db.query(queryDelete, [category_id]);
        const deletedCategory = resultDelete.rows[0];

        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        return res.status(200).json({ message: 'Category deleted successfully', category_id: deletedCategory.category_id });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function userStatisticsByOrganization(req, res) {
    const { organization_id } = req.params;
    const query = `
        SELECT
            COUNT(u.user_id) AS total_users,
            COUNT(CASE WHEN r.name = 'Admin' THEN 1 END) AS admin_count,
            COUNT(CASE WHEN r.name = 'Authorizer' THEN 1 END) AS authorizer_count,
            COUNT(CASE WHEN r.name = 'Standard' THEN 1 END) AS standard_user_count,
            COUNT(CASE WHEN u.verified = false THEN 1 END) AS unverified_count,
            COUNT(CASE WHEN u.block = true THEN 1 END) AS blocked_count
        FROM elkem.users u
        LEFT JOIN elkem.roles r ON u.role_id = r.role_id
        WHERE u.organization_id = $1
        AND u.deleted = false
    `;

    try {
        const result = await db.query(query, [organization_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No users found for this organization' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user statistics:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateUserFromAdmin(req, res) {
    const { user_id } = req.params; // Extract user_id from URL parameters
    const { personal_email, first_name, last_name, role_id, plant_id, contact_no, department_id } = req.body;

    if (!user_id || !personal_email || !first_name || !last_name || !role_id || !plant_id || !contact_no || !department_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const username = personal_email;

    try {
        // Update query for users table, now including department_id
        const queryUpdate = `
            UPDATE elkem.users
            SET 
                username = $2,
                personal_email = $3,
                first_name = $4,
                last_name = $5,
                role_id = $6,
                plant_id = $7,
                department_id = $8,
                contact_no = $9
            WHERE user_id = $1
            RETURNING user_id`;

        const values = [user_id, username, personal_email, first_name, last_name, role_id, plant_id, department_id, contact_no];

        const resultUpdate = await db.query(queryUpdate, values);
        const updatedUser = resultUpdate.rows[0];

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllFrequency(req, res) {
    try {
        const queryFetchIcons = `
            SELECT *
            FROM elkem.frequency
        `;

        const result = await db.query(queryFetchIcons);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No Frequency found' });
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching icons:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllModeration(req, res) {
    try {
        const queryFetchIcons = `
            SELECT *
            FROM elkem.moderation
        `;

        const result = await db.query(queryFetchIcons);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No Moderation found' });
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching icons:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addFormToCategory(req, res) {
    const {
        formName,
        formDescription,
        formVersion,
        frequency,
        moderation,
        needOfApproval,
        formsData,
        CreatedBy,
        CategoryId
    } = req.body;

    if (!formName || !formDescription || !formVersion || !frequency || !moderation || !formsData || !CreatedBy  || !CategoryId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const form_id = uuidv4();
    const created_at = new Date().toISOString();

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const queryForm = `
            INSERT INTO elkem.forms (form_id, form_name, form_description, version, frequency_id, moderation_id, form_data, created_by, created_at, needs_approval, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING form_id
        `;
        const valuesForm = [
            form_id,
            formName,
            formDescription,
            formVersion,
            frequency,
            moderation,
            JSON.stringify(formsData),
            CreatedBy,
            created_at,
            needOfApproval,
            CategoryId
        ];

        const resultForm = await client.query(queryForm, valuesForm);
        const newFormId = resultForm.rows[0].form_id;

        await client.query('COMMIT');
        res.status(201).json({ form_id: newFormId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding form data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}

async function previousFormsByCategories(req, res) {
    const { category_id } = req.params;
    const query = `
        SELECT 
            f.form_id,
            f.category_id,
            f.form_name,
            f.form_description,
            f.version,
            fr.frequency_name,
            mo.moderation_name,
            CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
            f.created_at,
            f.needs_approval,
            f.status,
            f.form_data
        FROM elkem.forms f
        LEFT JOIN elkem.frequency fr ON f.frequency_id = fr.frequency_id
        LEFT JOIN elkem.moderation mo ON f.moderation_id = mo.moderation_id
        LEFT JOIN elkem.users u ON f.created_by = u.user_id
        WHERE f.category_id = $1
    `;
    try {
        const result = await db.query(query, [category_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Forms not found' });
        }
        
        // Modify the result to exclude the IDs (frequency_id, moderation_id, created_by)
        const modifiedResults = result.rows.map(form => {
            const { frequency_name, moderation_name, created_by_name, ...formWithoutIds } = form;
            return {
                ...formWithoutIds,
                frequency_name,
                moderation_name,
                created_by_name
            };
        });

        res.status(200).json(modifiedResults);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteUser(req, res) {
    const { user_id } = req.params;

    // Update query to set 'deleted' to true for the given user
    const queryDelete = `
        UPDATE elkem.users 
        SET deleted = true 
        WHERE user_id = $1 
        RETURNING user_id, deleted`;

    try {
        const resultDelete = await db.query(queryDelete, [user_id]);
        const deletedUser = resultDelete.rows[0];

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return success message with the updated status
        return res.status(200).json({ 
            message: 'User deleted successfully', 
        });
    } catch (error) {
        console.error('Error marking user as deleted:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getDepartmentsByOrganizationId(req, res) {
    const { organization_id } = req.params; // Extract organization_id from URL parameters

    if (!organization_id) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }

    try {
        // Query to get all departments for the given organization
        const query = `
            SELECT d.department_id, d.name, d.plant_id, d.created_at
            FROM elkem.departments d
            JOIN elkem.plants p ON d.plant_id = p.plant_id
            WHERE p.organization_id = $1
            ORDER BY d.name`;

        const result = await db.query(query, [organization_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No departments found for this organization' });
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    organizationByOrganizationId,
    FormByFormId,
    plantsByOrganizationId,
    departmentsByPlantId,
    userByDepartmentId,
    userByPlantId,
    usersByOrganizationId,
    CategoriesByDepartmentId,
    previousFormsByCategories,
    addPlantsInOrganization,
    addDepartmentInPlants,
    updatePlantByPlantId,
    updateDepartmentByDepartmentId,
    deletePlantByPlantId,
    deleteFormByFormId,
    deleteDepartmentByDepartmentId,
    userRoles,
    addFormData,
    addUser,
    updateUser,
    addCategory,
    deleteUser,
    getAllIcons,
    editCategory,
    deleteCategoryByCategoryId,
     userStatisticsByOrganization,
    updateUserFromAdmin,
    getAllFrequency,
    getAllModeration,
    addFormToCategory,
    getDepartmentsByOrganizationId
}