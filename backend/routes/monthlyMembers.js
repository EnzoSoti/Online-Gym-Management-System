const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Enhanced error handling for database operations
const handleDatabaseOperation = async (operation, pool) => {
  const connection = await pool.getConnection();
  try {
    const result = await operation(connection);
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Monthly Members API Routes
router.get('/', async (req, res) => {
  try {
    const members = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        'SELECT * FROM monthly_members ORDER BY member_name'
      );
      return rows;
    }, req.app.locals.pool);
    res.json(members);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.post(
  '/',
  upload.fields([
    { name: 'school_id_picture', maxCount: 1 },
    { name: 'profile_picture', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { member_name, status, type, start_date, end_date } = req.body;

      // Validate required fields
      if (!member_name || !status || !type || !start_date || !end_date) {
        return res.status(400).json({
          error: 'All fields are required',
        });
      }

      // Validate profile picture
      if (!req.files || !req.files.profile_picture) {
        return res.status(400).json({
          error: 'Profile picture is required for new members',
        });
      }

      // Validate school ID picture only if the type is "Student"
      if (type === 'Student' && (!req.files || !req.files.school_id_picture)) {
        return res.status(400).json({
          error: 'School ID picture is required for Student members',
        });
      }

      const school_id_path = req.files.school_id_picture
        ? req.files.school_id_picture[0].filename
        : null;
      const profile_picture_path = req.files.profile_picture[0].filename;

      const result = await handleDatabaseOperation(async (connection) => {
        const [insertResult] = await connection.query(
          `INSERT INTO monthly_members 
                    (member_name, status, type, start_date, end_date, school_id_picture, profile_picture) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            member_name,
            status,
            type,
            start_date,
            end_date,
            school_id_path,
            profile_picture_path,
          ]
        );
        return insertResult;
      }, req.app.locals.pool);

      res.status(201).json({
        message: 'Member added successfully',
        memberId: result.insertId,
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

router.put(
  '/:id',
  upload.fields([
    { name: 'school_id_picture', maxCount: 1 },
    { name: 'profile_picture', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { member_name, status, type, start_date, end_date } = req.body;

      if (!member_name || !status || !type || !start_date || !end_date) {
        return res.status(400).json({
          error: 'All fields are required',
        });
      }

      const updateQuery = `UPDATE monthly_members 
                               SET member_name = ?, status = ?, type = ?, 
                                   start_date = ?, end_date = ?
                               WHERE id = ?`;

      const updateFields = [
        member_name,
        status,
        type,
        start_date,
        end_date,
        id,
      ];

      const result = await handleDatabaseOperation(async (connection) => {
        const [updateResult] = await connection.query(
          updateQuery,
          updateFields
        );
        return updateResult;
      }, req.app.locals.pool);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Member not found',
        });
      }

      res.json({
        message: 'Member updated successfully',
        memberId: id,
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to update member' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await handleDatabaseOperation(async (connection) => {
      const [deleteResult] = await connection.query(
        'DELETE FROM monthly_members WHERE id = ?',
        [id]
      );
      return deleteResult;
    }, req.app.locals.pool);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

router.put('/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await handleDatabaseOperation(async (connection) => {
      const [updateResult] = await connection.query(
        'UPDATE monthly_members SET status = ? WHERE id = ?',
        [status, id]
      );
      return updateResult;
    }, req.app.locals.pool);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Customer registration endpoint
router.post(
  '/customer',
  upload.fields([
    { name: 'school_id_picture', maxCount: 1 },
    { name: 'profile_picture', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        member_name,
        type,
        start_date,
        end_date,
        gcash_ref,
        gcash_name,
        amount_paid,
        email,
      } = req.body;
      const school_id_picture = req.files['school_id_picture']
        ? req.files['school_id_picture'][0].buffer
        : null;
      const profile_picture = req.files['profile_picture']
        ? req.files['profile_picture'][0].buffer
        : null;

      if (
        !member_name ||
        !type ||
        !start_date ||
        !end_date ||
        !gcash_ref ||
        !gcash_name ||
        !amount_paid ||
        !email
      ) {
        return res.status(400).json({
          error:
            'Member name, type, start date, end date, GCash reference number, account name, amount paid, and email are required',
        });
      }

      const finalStatus = 'Pending';

      const result = await handleDatabaseOperation(async (connection) => {
        const [insertResult] = await connection.query(
          'INSERT INTO monthly_members (member_name, status, type, start_date, end_date, school_id_picture, profile_picture, gcash_ref, gcash_name, amount_paid, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            member_name,
            finalStatus,
            type,
            start_date,
            end_date,
            school_id_picture,
            profile_picture,
            gcash_ref,
            gcash_name,
            amount_paid,
            email,
          ]
        );
        return insertResult;
      }, req.app.locals.pool);

      res.status(201).json({
        message: 'Member added successfully',
        memberId: result.insertId,
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

router.put('/:id/verify-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await handleDatabaseOperation(async (connection) => {
      const [updateResult] = await connection.query(
        'UPDATE monthly_members SET status = ? WHERE id = ?',
        ['Active', id]
      );
      return updateResult;
    }, req.app.locals.pool);

    res.status(200).json({
      message: 'Payment verified and member status updated to Active',
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await handleDatabaseOperation(async (connection) => {
      const [updateResult] = await connection.query(
        'UPDATE monthly_members SET status = ? WHERE id = ?',
        ['Active', id]
      );
      return updateResult;
    }, req.app.locals.pool);

    // Fetch the email address of the member
    const [member] = await handleDatabaseOperation(async (connection) => {
      return connection.query(
        'SELECT email FROM monthly_members WHERE id = ?',
        [id]
      );
    }, req.app.locals.pool);

    const email = member[0].email;

    // Send email notification
    await req.app.locals.transporter.sendMail({
      from: '"Fitworx Gym" <fitworxgym082@gmail.com>',
      to: email,
      subject: 'Membership Verified',
      text: 'Your membership has been verified and is now active.',
      html: '<b>Your membership has been verified and is now active.</b>',
    });

    res.status(200).json({
      message: 'Member verified successfully',
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to verify member' });
  }
});

router.post('/:id/send-email', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the email address and other details of the member
    const [member] = await handleDatabaseOperation(async (connection) => {
      return connection.query(
        'SELECT email, member_name, type, amount_paid, gcash_ref, gcash_name FROM monthly_members WHERE id = ?',
        [id]
      );
    }, req.app.locals.pool);

    if (!member || member.length === 0) {
      console.error(`Member with ID ${id} not found.`);
      return res.status(404).json({ error: 'Member not found' });
    }

    const email = member[0].email;
    const memberName = member[0].member_name;
    const membershipType = member[0].type;
    const amountPaid = member[0].amount_paid;
    const gcashRef = member[0].gcash_ref;
    const gcashName = member[0].gcash_name;

    // Send email notification
    await req.app.locals.transporter.sendMail({
      from: '"Fitworx Gym" <fitworxgym082@gmail.com>',
      to: email,
      subject: 'Your Monthly Pass Membership is Now Active!',
      text: `Dear ${memberName},\n\nWe are pleased to inform you that your monthly pass membership at Fitworx Gym is now active. Enjoy your workouts!\n\nBest regards,\nFitworx Gym Team`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #1a1a1a;">Dear ${memberName},</h2>
                    <p style="font-size: 16px; line-height: 1.6;">We are pleased to confirm that your monthly pass membership at Fitworx Gym is now active.</p>
                    
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Membership Details</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Membership Type:</strong> ${membershipType}</li>
                            <li><strong>Amount Paid:</strong> ₱${amountPaid}</li>
                            <li><strong>GCash Reference Number:</strong> ${gcashRef}</li>
                            <li><strong>GCash Account Name:</strong> ${gcashName}</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Membership Perks</h3>
                        <ul style="color: #333; padding-left: 20px;">
                            <li>24/7 Gym Access</li>
                            <li>Access to All Equipment</li>
                        </ul>
                    </div>

                    <p style="line-height: 1.6;">We look forward to supporting your fitness journey and helping you achieve your health goals at Fitworx Gym.</p>

                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                        <a href="https://www.facebook.com/fitworxgymph" style="display: inline-block; padding: 10px 20px; background-color: #2c3e50; color: #fff; text-decoration: none; border-radius: 4px;">Visit Our Facebook Page</a>
                        <a href="mailto:support@fitworxgym.com" style="display: inline-block; padding: 10px 20px; background-color: #34495e; color: #fff; text-decoration: none; border-radius: 4px;">Contact Support</a>
                    </div>

                    <p style="margin-top: 20px; color: #666;">Best regards,<br>Fitworx Gym Team</p>

                    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Fitworx Gym &copy; ${new Date().getFullYear()}. All rights reserved.</p>
                        <p>Contact us at <a href="mailto:support@fitworxgym.com" style="color: #2c3e50; text-decoration: none;">support@fitworxgym.com</a></p>
                    </footer>
                </div>
            `,
    });

    res.status(200).json({
      message: 'Email notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

router.get('/:id/picture', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        'SELECT school_id_picture FROM monthly_members WHERE id = ?',
        [id]
      );
      return rows[0];
    }, req.app.locals.pool);

    if (!result || !result.school_id_picture) {
      return res.status(404).json({ error: 'Picture not found' });
    }

    res.contentType('image/jpeg'); // Adjust the content type based on your image format
    res.send(result.school_id_picture);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to retrieve picture' });
  }
});

router.get('/:id/profile-picture', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        'SELECT profile_picture FROM monthly_members WHERE id = ?',
        [id]
      );
      return rows[0];
    }, req.app.locals.pool);

    if (!result || !result.profile_picture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    res.contentType('image/jpeg'); // Adjust the content type based on your image format
    res.send(result.profile_picture);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
});

router.put('/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ error: 'Start date and end date are required' });
    }

    const result = await handleDatabaseOperation(async (connection) => {
      // Fetch the member details
      console.log('Fetching member details for ID:', id);
      const [memberRows] = await connection.query(
        'SELECT type FROM monthly_members WHERE id = ?',
        [id]
      );

      if (memberRows.length === 0) {
        console.log('Member not found for ID:', id);
        return res.status(404).json({ error: 'Member not found' });
      }

      const memberType = memberRows[0].type;
      let renewalAmount = 0;

      // Calculate the renewal amount based on the member type
      if (memberType === 'student') {
        renewalAmount = 850;
      } else if (memberType === 'regular') {
        renewalAmount = 950;
      }

      console.log('Renewal amount calculated:', renewalAmount);

      // Update the member's renewal details
      console.log('Updating member details for ID:', id);
      const [updateResult] = await connection.query(
        'UPDATE monthly_members SET status = ?, start_date = ?, end_date = ?, renewal_date = ?, renewal_amount = ? WHERE id = ?',
        ['Active', start_date, end_date, new Date(), renewalAmount, id]
      );

      console.log('Update result:', updateResult);

      return { renewalAmount };
    }, req.app.locals.pool);

    res.status(200).json({
      message: 'Membership renewed successfully',
      renewalAmount: result.renewalAmount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

module.exports = router;