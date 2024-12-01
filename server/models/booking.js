const pool = require('../db');
const nodemailer = require('nodemailer');

// Email küldés 
const sendEmail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error while sending email:', error.message);
    } else {
      console.log(`Email successfully sent to: ${to}, response: ${info.response}`);
    }
  });
};


const checkBookingAvailability = async (datum, starttime, endtime) => {
  try {
    console.log('Checking booking availability:', datum, starttime, endtime);
    const result = await pool.query(
      `SELECT * FROM foglalasok 
       WHERE datum = $1 
       AND (starttime, endtime) OVERLAPS ($2, $3)`,
      [datum, starttime, endtime]
    );
    return result.rows.length === 0; 
  } catch (error) {
    console.error('Error while checking booking availability:', error.message);
    throw new Error('An error occurred while checking booking availability.');
  }
};

// Új foglalás
const createBookingInDB = async (userId, serviceId, datum, timeslotId, status) => {
  const result = await pool.query(
    `INSERT INTO foglalasok (userid, serviceid, datum, timeslotid, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userid, serviceId, datum, timeslotId, status]
  );

  const customerQuery = await pool.query(
    `SELECT name, email FROM ugyfelek WHERE userid = $1`,
    [userId]
  );
  const customer = customerQuery.rows[0];

  //ügyfél
  sendEmail(
    customer.email,
    'Booking Confirmation',
    `Dear ${customer.name},\n\nYour booking has been confirmed.\nDate: ${datum}\nTimeslot: ${timeslotId}`
  );

  //admin
  sendEmail(
    process.env.ADMIN_EMAIL,
    'New Booking Received',
    `A new booking has been received.\nCustomer: ${customer.name}\nDate: ${datum}\nTimeslot: ${timeslotId}`
  );

  return result.rows[0];
};

// Update 
const updateBookingStatusInDB = async (bookingId, status) => {
  const result = await pool.query(
    `UPDATE foglalasok SET status = $1 WHERE foglalasid = $2 RETURNING *`,
    [status, bookingId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const booking = result.rows[0];
  const customerQuery = await pool.query(
    `SELECT name, email FROM ugyfelek WHERE userid = $1`,
    [booking.userid]
  );
  const customer = customerQuery.rows[0];

  // ügyfél
  sendEmail(
    customer.email,
    'Booking Status Update',
    `Dear ${customer.name},\n\nYour booking status has been updated to: ${status}`
  );

  //  admin
  sendEmail(
    process.env.ADMIN_EMAIL,
    'Booking Status Updated',
    `The booking status has been updated.\nBooking ID: ${bookingId}\nNew Status: ${status}`
  );

  return result.rows[0];
};

// Delete
const deleteBookingById = async (bookingId) => {

  const result = await pool.query(
    'DELETE FROM foglalasok WHERE foglalasid = $1 RETURNING *',
    [bookingId]
  );

  if (result.rows.length === 0) {
    console.error('Error: Booking not found in the database.');
    return null;
  }

  const booking = result.rows[0];

  // userId ellenőrzés
  if (!booking.userid) {
    console.error('Error: User ID is missing from the booking.');
    sendEmail(
      process.env.ADMIN_EMAIL,
      'Booking Deleted - Missing User Information',
      `Booking deleted.\nBooking ID: ${bookingId}\nUser ID: Missing`
    );
    return booking;
  }

  const customerQuery = await pool.query(
    `SELECT name, email FROM ugyfelek WHERE userid = $1`,
    [booking.userid]
  );
  const customer = customerQuery.rows[0];

  // Debug log hozzáadása a lekérdezés után
  console.log('Raw Start Time:', booking.starttime);
  console.log('Raw End Time:', booking.endtime);
  console.log('Start Time Type:', typeof booking.starttime);
  console.log('End Time Type:', typeof booking.endtime);

  const formattedDate = new Date(Date.parse(booking.datum)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startTime = new Date(Date.parse(booking.starttime)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = new Date(Date.parse(booking.endtime)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });


  //ügyfél
  if (customer && customer.email) {
    sendEmail(
      customer.email,
      'Booking Deleted',
      `Dear ${customer.name},\n\nYour booking has been deleted.\nDate: ${formattedDate}\nTime: ${startTime}–${endTime}`
    );
  } else {
    console.log('Customer email is missing. Notification skipped.');
  }

  //admin
  sendEmail(
    process.env.EMAIL_USER,
    'Booking Deleted',
    `Booking has been deleted.\nBooking ID: ${bookingId},\nDate: ${formattedDate}\nTime: ${startTime}–${endTime}`
  );

  return booking;
};


const getBookingById = async (bookingId) => {
  try {
    const result = await pool.query(
      `SELECT f.foglalasid, f.datum, f.status, 
              f.timeslotid, f.serviceid, 
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              t.starttime, t.endtime, t.isavailable,
              s.nev AS service_name, s.ar AS service_price
       FROM foglalasok f
       LEFT JOIN ugyfelek u ON f.userid = u.userid
       LEFT JOIN timeslots t ON f.timeslotid = t.timeslotid
       LEFT JOIN szolgaltatasok s ON f.serviceid = s.serviceid
       WHERE f.foglalasid = $1`,
      [bookingId]
    );

    if (!result.rows.length) {
      console.log(`No booking found for ID: ${bookingId}`);
      return null;
    }


    return result.rows[0];
  } catch (error) {
    console.error('Error while fetching booking by ID:', error.message);
    throw new Error('An error occurred while fetching the booking.');
  }
};

module.exports = {
  createBookingInDB,
  updateBookingStatusInDB,
  deleteBookingById,
  checkBookingAvailability,
  getAllBookings: async () => {
    const result = await pool.query('SELECT * FROM foglalasok');
    return result.rows;
  },
  getBookingById,
};
