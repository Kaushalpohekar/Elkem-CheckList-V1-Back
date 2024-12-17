const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

// Utility Function: Sanitize Input
function sanitizeInput(input) {
    return input.replace(/[^\w\s.-]/gi, '');
}

// Fetch Unsubmitted Forms
// async function getUnsubmittedForms(req, res) {
//     const { plant_id } = req.params;
//     const { date } = req.query; // The date to compare with, passed in the request body

//     if (!plant_id) {
//         return res.status(400).json({ error: 'plant_id is required' });
//     }

//     if (!date) {
//         return res.status(400).json({ error: 'date is required in the request body' });
//     }

//     try {
//         // Format the date to ensure it's in a valid format (e.g., 'YYYY-MM-DD')
//         const comparisonDate = new Date(date).toISOString().split('T')[0];

//         // Query to fetch unsubmitted forms based on their frequency and the provided date
//         const query = `
//             WITH eligible_forms AS (
//                 SELECT 
//                     f.form_id,
//                     f.form_name,
//                     f.form_description,
//                     f.frequency_id,
//                     f.moderation_id,
//                     f.needs_approval,
//                     f.status,
//                     freq.frequency_name
//                 FROM 
//                     elkem.forms f
//                 INNER JOIN elkem.categories c ON f.category_id = c.category_id
//                 INNER JOIN elkem.departments d ON c.department_id = d.department_id
//                 INNER JOIN elkem.plants p ON d.plant_id = p.plant_id
//                 INNER JOIN elkem.frequency freq ON f.frequency_id = freq.frequency_id
//                 WHERE 
//                     p.plant_id = $1 
//                     AND f.status = true
//             ),
//             submission_check AS (
//                 SELECT 
//                     ef.form_id,
//                     ef.form_name,
//                     ef.form_description,
//                     ef.frequency_name,
//                     CASE 
//                         WHEN ef.frequency_name = 'Daily' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s 
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) = $2
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Weekly' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('week', $2) AND DATE_TRUNC('week', $2) + INTERVAL '6 days'
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Each 15 Days' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND (
//                                 (EXTRACT(DAY FROM $2) <= 15 AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) AND DATE_TRUNC('month', $2) + INTERVAL '14 days')
//                                 OR (EXTRACT(DAY FROM $2) > 15 AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) + INTERVAL '15 days' AND DATE_TRUNC('month', $2) + INTERVAL '1 month - 1 day')
//                             )
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Monthly' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) AND DATE_TRUNC('month', $2) + INTERVAL '1 month - 1 day'
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Quarterly' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('quarter', $2) AND DATE_TRUNC('quarter', $2) + INTERVAL '3 months - 1 day'
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Half Yearly' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('year', $2) AND DATE_TRUNC('year', $2) + INTERVAL '6 months - 1 day'
//                         ) THEN true
//                         WHEN ef.frequency_name = 'Yearly' AND NOT EXISTS (
//                             SELECT 1 
//                             FROM elkem.submissions s
//                             WHERE s.form_id = ef.form_id
//                             AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('year', $2) AND DATE_TRUNC('year', $2) + INTERVAL '1 year - 1 day'
//                         ) THEN true
//                         ELSE false
//                     END AS is_missing_submission
//                 FROM eligible_forms ef
//             )
//             SELECT 
//                 form_id,
//                 form_name,
//                 form_description,
//                 frequency_name
//             FROM submission_check
//             WHERE is_missing_submission = true;
//         `;

//         // Execute the query with plant_id and the provided date as parameters
//         const { rows } = await db.query(query, [plant_id, comparisonDate]);

//         if (rows.length === 0) {
//             return res.json({ message: 'No unsubmitted forms found for the given plant and date' });
//         }

//         // Return unsubmitted forms as JSON
//         res.json(rows);

//     } catch (error) {
//         console.error('Error fetching unsubmitted forms:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
async function getUnsubmittedForms(req, res) {
    const { department_id } = req.params;  // Get department_id from request parameters
    const { date } = req.query;  // The date to compare with, passed in the request body

    if (!department_id) {
        return res.status(400).json({ error: 'department_id is required' });
    }

    if (!date) {
        return res.status(400).json({ error: 'date is required in the request body' });
    }

    try {
        // Format the date to ensure it's in a valid format (e.g., 'YYYY-MM-DD')
        const comparisonDate = new Date(date).toISOString().split('T')[0];

        // Query to fetch unsubmitted forms based on their frequency and the provided date, using department_id instead of plant_id
        const query = `
            WITH eligible_forms AS (
                SELECT 
                    f.form_id,
                    f.form_name,
                    f.form_description,
                    f.frequency_id,
                    f.moderation_id,
                    m.moderation_name,
                    f.needs_approval,
                    f.status,
                    freq.frequency_name
                FROM 
                    elkem.forms f
                INNER JOIN elkem.categories c ON f.category_id = c.category_id
                INNER JOIN elkem.departments d ON c.department_id = d.department_id
                INNER JOIN elkem.frequency freq ON f.frequency_id = freq.frequency_id
                INNER JOIN elkem.moderation m ON f.moderation_id = m.moderation_id
                WHERE 
                    d.department_id = $1  -- Use department_id for filtering
                    AND f.status = true
            ),
            submission_check AS (
                SELECT 
                    ef.form_id,
                    ef.form_name,
                    ef.form_description,
                    ef.frequency_name,
                    ef.moderation_name,
                    CASE 
                        WHEN ef.frequency_name = 'Daily' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s 
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) = $2
                        ) THEN true
                        WHEN ef.frequency_name = 'Weekly' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('week', $2) AND DATE_TRUNC('week', $2) + INTERVAL '6 days'
                        ) THEN true
                        WHEN ef.frequency_name = 'Each 15 Days' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND (
                                (EXTRACT(DAY FROM $2) <= 15 AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) AND DATE_TRUNC('month', $2) + INTERVAL '14 days')
                                OR (EXTRACT(DAY FROM $2) > 15 AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) + INTERVAL '15 days' AND DATE_TRUNC('month', $2) + INTERVAL '1 month - 1 day')
                            )
                        ) THEN true
                        WHEN ef.frequency_name = 'Monthly' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('month', $2) AND DATE_TRUNC('month', $2) + INTERVAL '1 month - 1 day'
                        ) THEN true
                        WHEN ef.frequency_name = 'Quarterly' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('quarter', $2) AND DATE_TRUNC('quarter', $2) + INTERVAL '3 months - 1 day'
                        ) THEN true
                        WHEN ef.frequency_name = 'Half Yearly' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('year', $2) AND DATE_TRUNC('year', $2) + INTERVAL '6 months - 1 day'
                        ) THEN true
                        WHEN ef.frequency_name = 'Yearly' AND NOT EXISTS (
                            SELECT 1 
                            FROM elkem.submissions s
                            WHERE s.form_id = ef.form_id
                            AND DATE(s.submitted_at) BETWEEN DATE_TRUNC('year', $2) AND DATE_TRUNC('year', $2) + INTERVAL '1 year - 1 day'
                        ) THEN true
                        ELSE false
                    END AS is_missing_submission
                FROM eligible_forms ef
            )
            SELECT 
                form_id,
                form_name,
                form_description,
                frequency_name,
                moderation_name
            FROM submission_check
            WHERE is_missing_submission = true;
        `;

        // Execute the query with department_id and the provided date as parameters
        const { rows } = await db.query(query, [department_id, comparisonDate]);

        if (rows.length === 0) {
            return res.json({ message: 'No unsubmitted forms found for the given department and date' });
        }

        // Return unsubmitted forms as JSON
        res.json(rows);

    } catch (error) {
        console.error('Error fetching unsubmitted forms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// async function getFormCounts(req, res) {
//     const { plant_id } = req.params;
//     const { month, year } = req.query;

//     if (!plant_id) {
//         return res.status(400).json({ error: 'plant_id is required' });
//     }

//     if (!month || !year) {
//         return res.status(400).json({ error: 'month and year are required in the request query' });
//     }

//     try {
//         // Format the month and year to the first day of the month
//         const startDate = new Date(`${year}-${month}-01`).toISOString().split('T')[0];
//         const endDate = new Date(`${year}-${month}-01`);
//         endDate.setMonth(endDate.getMonth() + 1);
//         endDate.setDate(endDate.getDate() - 1);
//         const formattedEndDate = endDate.toISOString().split('T')[0];

//         const query = `
//             WITH eligible_forms AS (
//                 SELECT 
//                     f.form_id,
//                     f.form_name,
//                     f.frequency_id,
//                     f.needs_approval,
//                     freq.frequency_name
//                 FROM 
//                     elkem.forms f
//                 INNER JOIN elkem.categories c ON f.category_id = c.category_id
//                 INNER JOIN elkem.departments d ON c.department_id = d.department_id
//                 INNER JOIN elkem.plants p ON d.plant_id = p.plant_id
//                 INNER JOIN elkem.frequency freq ON f.frequency_id = freq.frequency_id
//                 WHERE 
//                     p.plant_id = $1
//                     AND f.status = true
//             ),
//             submission_data AS (
//                 SELECT 
//                     s.form_id,
//                     s.submitted_at::date AS submission_date,
//                     s.authorizer,
//                     CASE
//                         WHEN s.authorizer IS NULL THEN true
//                         ELSE false
//                     END AS waiting_approval
//                 FROM elkem.submissions s
//                 WHERE s.submitted_at::date BETWEEN $2 AND $3
//             ),
//             frequency_dates AS (
//                 SELECT 
//                     g.calendar_date,
//                     ef.form_id,
//                     ef.frequency_name,
//                     CASE 
//                         WHEN ef.frequency_name = 'Daily' THEN g.calendar_date
//                         WHEN ef.frequency_name = 'Weekly' THEN DATE_TRUNC('week', g.calendar_date)
//                         WHEN ef.frequency_name = 'Each 15 Days' THEN
//                             CASE 
//                                 WHEN EXTRACT(DAY FROM g.calendar_date) <= 15 THEN DATE_TRUNC('month', g.calendar_date)
//                                 ELSE DATE_TRUNC('month', g.calendar_date) + INTERVAL '15 days'
//                             END
//                         WHEN ef.frequency_name = 'Monthly' THEN DATE_TRUNC('month', g.calendar_date)
//                         WHEN ef.frequency_name = 'Quarterly' THEN DATE_TRUNC('quarter', g.calendar_date)
//                         WHEN ef.frequency_name = 'Half Yearly' THEN 
//                             CASE
//                                 WHEN EXTRACT(MONTH FROM g.calendar_date)::integer <= 6 THEN DATE_TRUNC('year', g.calendar_date)
//                                 ELSE DATE_TRUNC('year', g.calendar_date) + INTERVAL '6 months'
//                             END
//                         WHEN ef.frequency_name = 'Yearly' THEN DATE_TRUNC('year', g.calendar_date)
//                     END AS effective_date
//                 FROM generate_series($2::date, $3::date, '1 day'::interval) g(calendar_date)
//                 CROSS JOIN eligible_forms ef
//             ),
//             daily_data AS (
//                 SELECT
//                     f.calendar_date,
//                     ef.form_id,
//                     ef.frequency_name,
//                     sd.submission_date,
//                     sd.waiting_approval,
//                     CASE 
//                         WHEN sd.form_id IS NOT NULL THEN 'submitted'
//                         WHEN ef.needs_approval = true AND sd.waiting_approval = true THEN 'waiting_approval'
//                         ELSE 'pending'
//                     END AS status
//                 FROM frequency_dates f
//                 JOIN eligible_forms ef ON f.form_id = ef.form_id
//                 LEFT JOIN submission_data sd ON ef.form_id = sd.form_id
//                     AND (
//                         (ef.frequency_name = 'Daily' AND sd.submission_date = f.calendar_date)
//                         OR (ef.frequency_name != 'Daily' AND sd.submission_date = f.effective_date)
//                     )
//                 WHERE f.calendar_date = f.effective_date
//             )
//             SELECT 
//                 calendar_date,
//                 COUNT(CASE WHEN status = 'submitted' THEN 1 END) AS submitted_count,
//                 COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
//                 COUNT(CASE WHEN status = 'waiting_approval' THEN 1 END) AS waiting_approval_count
//             FROM daily_data
//             GROUP BY calendar_date
//             ORDER BY calendar_date;
//         `;

//         // Execute the query with plant_id, startDate, and endDate as parameters
//         const { rows } = await db.query(query, [plant_id, startDate, formattedEndDate]);

//         if (rows.length === 0) {
//             return res.json({ message: 'No data found for the given plant and date range' });
//         }

//         // Return daily counts as JSON
//         res.json(rows);

//     } catch (error) {
//         console.error('Error fetching form counts:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
async function getFormCounts(req, res) {
    const { department_id } = req.params;  // Get department_id from request parameters
    const { month, year } = req.query;

    if (!department_id) {
        return res.status(400).json({ error: 'department_id is required' });
    }

    if (!month || !year) {
        return res.status(400).json({ error: 'month and year are required in the request query' });
    }

    try {
        // Format the month and year to the first day of the month
        const startDate = new Date(`${year}-${month}-01`).toISOString().split('T')[0];
        const endDate = new Date(`${year}-${month}-01`);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const query = `
            WITH eligible_forms AS (
                SELECT 
                    f.form_id,
                    f.form_name,
                    f.frequency_id,
                    f.needs_approval,
                    freq.frequency_name
                FROM 
                    elkem.forms f
                INNER JOIN elkem.categories c ON f.category_id = c.category_id
                INNER JOIN elkem.departments d ON c.department_id = d.department_id
                INNER JOIN elkem.frequency freq ON f.frequency_id = freq.frequency_id
                WHERE 
                    d.department_id = $1  -- Use department_id for filtering
                    AND f.status = true
            ),
            submission_data AS (
                SELECT 
                    s.form_id,
                    s.submitted_at::date AS submission_date,
                    s.authorizer,
                    CASE
                        WHEN s.authorizer IS NULL THEN true
                        ELSE false
                    END AS waiting_approval
                FROM elkem.submissions s
                WHERE s.submitted_at::date BETWEEN $2 AND $3
            ),
            frequency_dates AS (
                SELECT 
                    g.calendar_date,
                    ef.form_id,
                    ef.frequency_name,
                    CASE 
                        WHEN ef.frequency_name = 'Daily' THEN g.calendar_date
                        WHEN ef.frequency_name = 'Weekly' THEN DATE_TRUNC('week', g.calendar_date)
                        WHEN ef.frequency_name = 'Each 15 Days' THEN
                            CASE 
                                WHEN EXTRACT(DAY FROM g.calendar_date) <= 15 THEN DATE_TRUNC('month', g.calendar_date)
                                ELSE DATE_TRUNC('month', g.calendar_date) + INTERVAL '15 days'
                            END
                        WHEN ef.frequency_name = 'Monthly' THEN DATE_TRUNC('month', g.calendar_date)
                        WHEN ef.frequency_name = 'Quarterly' THEN DATE_TRUNC('quarter', g.calendar_date)
                        WHEN ef.frequency_name = 'Half Yearly' THEN 
                            CASE
                                WHEN EXTRACT(MONTH FROM g.calendar_date)::integer <= 6 THEN DATE_TRUNC('year', g.calendar_date)
                                ELSE DATE_TRUNC('year', g.calendar_date) + INTERVAL '6 months'
                            END
                        WHEN ef.frequency_name = 'Yearly' THEN DATE_TRUNC('year', g.calendar_date)
                    END AS effective_date
                FROM generate_series($2::date, $3::date, '1 day'::interval) g(calendar_date)
                CROSS JOIN eligible_forms ef
            ),
            daily_data AS (
                SELECT
                    f.calendar_date,
                    ef.form_id,
                    ef.frequency_name,
                    sd.submission_date,
                    sd.waiting_approval,
                    CASE 
                        WHEN sd.form_id IS NOT NULL THEN 'submitted'
                        WHEN ef.needs_approval = true AND sd.waiting_approval = true THEN 'waiting_approval'
                        ELSE 'pending'
                    END AS status
                FROM frequency_dates f
                JOIN eligible_forms ef ON f.form_id = ef.form_id
                LEFT JOIN submission_data sd ON ef.form_id = sd.form_id
                    AND (
                        (ef.frequency_name = 'Daily' AND sd.submission_date = f.calendar_date)
                        OR (ef.frequency_name != 'Daily' AND sd.submission_date = f.effective_date)
                    )
                WHERE f.calendar_date = f.effective_date
            )
            SELECT 
                calendar_date,
                COUNT(CASE WHEN status = 'submitted' THEN 1 END) AS submitted_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
                COUNT(CASE WHEN status = 'waiting_approval' THEN 1 END) AS waiting_approval_count
            FROM daily_data
            GROUP BY calendar_date
            ORDER BY calendar_date;
        `;

        // Execute the query with department_id, startDate, and endDate as parameters
        const { rows } = await db.query(query, [department_id, startDate, formattedEndDate]);

        if (rows.length === 0) {
            return res.json({ message: 'No data found for the given department and date range' });
        }

        // Return daily counts as JSON
        res.json(rows);

    } catch (error) {
        console.error('Error fetching form counts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getFormById(req, res) {
    const { form_id } = req.params; // Extract form_id from URL parameters

    if (!form_id) {
        return res.status(400).json({ error: 'Form ID is required' });
    }

    try {
        // SQL query to fetch the form data with relationships
        const query = `
            SELECT 
                f.form_id,
                f.form_name,
                f.form_description,
                f.version,
                f.form_data,
                f.needs_approval,
                f.status,
                f.category_id,
                f.frequency_id,
                f.moderation_id,
                f.created_by,
                fr.frequency_name,
                m.moderation_name,
                c.name AS category_name,
                c.subtitle AS category_subtitle,
                c.icon AS category_icon,
                c.department_id
            FROM 
                elkem.forms f
            JOIN 
                elkem.frequency fr ON f.frequency_id = fr.frequency_id
            JOIN 
                elkem.moderation m ON f.moderation_id = m.moderation_id
            JOIN 
                elkem.categories c ON f.category_id = c.category_id
            WHERE 
                f.form_id = $1; -- Use parameterized query for security
        `;

        // Execute the query with the provided form_id
        const result = await db.query(query, [form_id]);

        // Check if the form was found
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Send the result as JSON response
        return res.status(200).json(result.rows[0]); // Return the first result since form_id is unique
    } catch (error) {
        console.error('Error fetching form by ID:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUserSubmissions(req, res) {
    const user_id = req.params.user_id;
    const interval = req.params.interval;
    const start_date = req.query.start; 
    const end_date = req.query.end;

    try {
        if (!user_id || !interval) {
            return res.status(400).json({ error: 'User ID and interval are required' });
        }

        let intervalCondition = '';
        let intervalValue = '';

        switch (interval) {
            case '1hour':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 hour'";
                intervalValue = 'Hour';
                break;
            case '1day':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 day'";
                intervalValue = 'Day';
                break;
            case '1week':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 week'";
                intervalValue = 'Week';
                break;
            case '1month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 month'";
                intervalValue = 'Month';
                break;
            case '6month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '6 month'";
                intervalValue = 'Half Year';
                break;
            case '12month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 year'";
                intervalValue = 'Full Year';
                break;
            case 'custom':
                if (!start_date || !end_date) {
                    return res.status(400).json({ error: 'Start and end dates are required for custom interval' });
                }
                intervalCondition = "AND s.submitted_at BETWEEN $2 AND $3";
                intervalValue = 'Custom';
                break;
            default:
                return res.status(400).json({ error: 'Invalid interval value' });
        }

        // Query with joins to fetch all required data in one go
        const userFormQuery = `
            SELECT 
                s.submission_id,
                s.form_id,
                s.form_name,
                s.form_description,
                s.version,
                s.needs_approval,
                s.submitted_at,
                f.frequency_name,
                m.moderation_name,
                au.first_name AS authorizer_first_name,
                au.last_name AS authorizer_last_name
            FROM 
                elkem.submissions s
            LEFT JOIN elkem.frequency f ON s.frequency_id = f.frequency_id
            LEFT JOIN elkem.moderation m ON s.moderation_id = m.moderation_id
            LEFT JOIN elkem.users au ON s.authorizer = au.user_id
            WHERE 
                s.submitted_by = $1 
                ${intervalCondition}
            ORDER BY 
                s.submitted_at DESC`;

        const queryParams = [user_id];
        if (interval === 'custom') {
            queryParams.push(start_date, end_date);
        }

        const result = await db.query(userFormQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No submissions available for the specified request' });
        }

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error fetching user submissions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getSubmissionData(req, res) {
    const submissionId = req.params.submission_id; // Expecting submissionId as a URL parameter

    try {
        if (!submissionId) {
            return res.status(400).json({ error: 'Submission ID is required' });
        }

        // Query to fetch specific submission data with all necessary joins
        const submissionQuery = `
            SELECT 
                s.submission_id,
                s.form_id,
                s.form_name,
                s.form_description,
                s.version,
                s.needs_approval,
                s.submitted_at,
                s.status,
                s.form_data,  -- Assuming 'form_data' is the column storing the actual form data
                f.frequency_name,
                m.moderation_name,
                au.first_name AS authorizer_first_name,
                au.last_name AS authorizer_last_name
            FROM 
                elkem.submissions s
            LEFT JOIN elkem.frequency f ON s.frequency_id = f.frequency_id
            LEFT JOIN elkem.moderation m ON s.moderation_id = m.moderation_id
            LEFT JOIN elkem.users au ON s.authorizer = au.user_id
            WHERE 
                s.submission_id = $1
            LIMIT 1;`;

        const result = await db.query(submissionQuery, [submissionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json(result.rows[0]);  // Return only the first row (the specific submission)

    } catch (err) {
        console.error('Error fetching submission data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAuthorizerSubmissions(req, res) {
    const user_id = req.params.user_id;
    const interval = req.params.interval;
    const start_date = req.query.start; 
    const end_date = req.query.end;

    try {
        if (!user_id || !interval) {
            return res.status(400).json({ error: 'User ID and interval are required' });
        }

        let intervalCondition = '';
        let intervalValue = '';

        switch (interval) {
            case '1hour':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 hour'";
                intervalValue = 'Hour';
                break;
            case '1day':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 day'";
                intervalValue = 'Day';
                break;
            case '1week':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 week'";
                intervalValue = 'Week';
                break;
            case '1month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 month'";
                intervalValue = 'Month';
                break;
            case '6month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '6 month'";
                intervalValue = 'Half Year';
                break;
            case '12month':
                intervalCondition = "AND s.submitted_at >= NOW() - INTERVAL '1 year'";
                intervalValue = 'Full Year';
                break;
            case 'custom':
                if (!start_date || !end_date) {
                    return res.status(400).json({ error: 'Start and end dates are required for custom interval' });
                }
                intervalCondition = "AND s.submitted_at BETWEEN $2 AND $3";
                intervalValue = 'Custom';
                break;
            default:
                return res.status(400).json({ error: 'Invalid interval value' });
        }

        // Query with joins to fetch all required data in one go
        const userFormQuery = `
            SELECT 
                s.submission_id,
                s.form_id,
                s.form_name,
                s.form_description,
                s.version,
                s.needs_approval,
                s.submitted_at,
                f.frequency_name,
                m.moderation_name,
                au.first_name AS authorizer_first_name,
                au.last_name AS authorizer_last_name
            FROM 
                elkem.submissions s
            LEFT JOIN elkem.frequency f ON s.frequency_id = f.frequency_id
            LEFT JOIN elkem.moderation m ON s.moderation_id = m.moderation_id
            LEFT JOIN elkem.users au ON s.submitted_by = au.user_id
            WHERE 
                s.authorizer = $1 
                ${intervalCondition}
            ORDER BY 
                s.submitted_at DESC`;

        const queryParams = [user_id];
        if (interval === 'custom') {
            queryParams.push(start_date, end_date);
        }

        const result = await db.query(userFormQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No submissions available for the specified request' });
        }

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error fetching user submissions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// async function getSubmissionDataAuth(req, res) {
//     const submissionId = req.params.submission_id; // Expecting submissionId as a URL parameter

//     try {
//         if (!submissionId) {
//             return res.status(400).json({ error: 'Submission ID is required' });
//         }

//         // Query to fetch specific submission data with all necessary joins
//         const submissionQuery = `
//             SELECT 
//                 s.submission_id,
//                 s.form_id,
//                 s.form_name,
//                 s.form_description,
//                 s.version,
//                 s.needs_approval,
//                 s.submitted_at,
//                 s.status,
//                 s.form_data,  -- Assuming 'form_data' is the column storing the actual form data
//                 f.frequency_name,
//                 m.moderation_name,
//                 au.first_name AS authorizer_first_name,
//                 au.last_name AS authorizer_last_name,
//                 su.first_name AS submitted_first_name,  -- Fetch submitted_by first name
//                 su.last_name AS submitted_last_name    -- Fetch submitted_by last name
//             FROM 
//                 elkem.submissions s
//             LEFT JOIN elkem.frequency f ON s.frequency_id = f.frequency_id
//             LEFT JOIN elkem.moderation m ON s.moderation_id = m.moderation_id
//             LEFT JOIN elkem.users au ON s.authorizer = au.user_id  -- Authorizer details
//             LEFT JOIN elkem.users su ON s.submitted_by = su.user_id  -- Submitted_by user details
//             WHERE 
//                 s.submission_id = $1
//             LIMIT 1;`;

//         const result = await db.query(submissionQuery, [submissionId]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Submission not found' });
//         }

//         res.status(200).json(result.rows[0]);  // Return only the first row (the specific submission)

//     } catch (err) {
//         console.error('Error fetching submission data:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }


async function getSubmissionDataAuth(req, res) {
    const submissionId = req.params.submission_id; // Expecting submissionId as a URL parameter

    try {
        if (!submissionId) {
            return res.status(400).json({ error: 'Submission ID is required' });
        }

        // Extended query to fetch authorizer's signature path and name
        const submissionQuery = `
            SELECT 
                s.submission_id,
                s.form_id,
                s.form_name,
                s.form_description,
                s.version,
                s.needs_approval,
                s.submitted_at,
                s.status,
                s.form_data,
                f.frequency_name,
                m.moderation_name,
                au.first_name AS authorizer_first_name,
                au.last_name AS authorizer_last_name,
                su.first_name AS submitted_first_name,
                su.last_name AS submitted_last_name,
                us.sign_path AS authorizer_sign_path, -- Authorizer signature path
                us.sign_name AS authorizer_sign_name -- Authorizer signature name
            FROM 
                elkem.submissions s
            LEFT JOIN elkem.frequency f ON s.frequency_id = f.frequency_id
            LEFT JOIN elkem.moderation m ON s.moderation_id = m.moderation_id
            LEFT JOIN elkem.users au ON s.authorizer = au.user_id -- Authorizer details
            LEFT JOIN elkem.users su ON s.submitted_by = su.user_id -- Submitted_by user details
            LEFT JOIN elkem.usersignaturephotos us ON au.user_id = us.user_id -- Authorizer signature
            WHERE 
                s.submission_id = $1
            LIMIT 1;`;

        // Execute query
        const result = await db.query(submissionQuery, [submissionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submissionData = result.rows[0];

        // Convert the authorizer's signature to Base64 if path exists
        if (submissionData.authorizer_sign_path !== null) {
            try {
                const fileBuffer = fs.readFileSync(submissionData.authorizer_sign_path);
                const base64File = fileBuffer.toString('base64');
                const mimeType = mime.lookup(submissionData.authorizer_sign_name);
                submissionData.authorizer_gsign= `data:${mimeType || 'application/octet-stream'};base64,${base64File}`;
            } catch (err) {
                console.error('Error reading signature photo:', err);
                submissionData.authorizer_gsign = null;
            }
        }

        res.status(200).json(submissionData); // Send the updated submission data with gsign

    } catch (err) {
        console.error('Error fetching submission data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Export Functions
module.exports = {
    getUnsubmittedForms,
    getFormCounts,
    getFormById,
    getUserSubmissions,
    getSubmissionData,
    getAuthorizerSubmissions,
    getSubmissionDataAuth
};
