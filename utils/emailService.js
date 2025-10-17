// utils/emailService.js
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  const { user, service, bookingDate, timeSlot, totalPrice, address } = booking;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Service Booking" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🎉 Booking Received - Service Booking Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
          .status-badge { background: #fbbf24; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We have received your booking request. Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span>${service.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span>${service.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span>${address}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span><strong>$${totalPrice.toFixed(2)}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge">PENDING APPROVAL</span>
              </div>
            </div>

            <p><strong>⏳ What's Next?</strong></p>
            <p>Your booking is currently pending approval. Our team will review and confirm your booking shortly. You will receive another email once your booking is confirmed.</p>
            
            <p><strong>⚠️ Important:</strong> Please be ready 5 minutes before your scheduled time once confirmed.</p>

            <p>Thank you for choosing our service!</p>
            <p>Best regards,<br><strong>Service Booking Team</strong></p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
            <p>&copy; 2025 Service Booking Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', user.email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send booking status update email
const sendStatusUpdateEmail = async (booking, newStatus) => {
  const { user, service, bookingDate, timeSlot } = booking;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statusConfig = {
    confirmed: {
      title: '✅ Booking Confirmed',
      message: 'Great news! Your booking has been confirmed by our team.',
      color: '#10b981',
      icon: '✅'
    },
    completed: {
      title: '🎊 Service Completed',
      message: 'Thank you for using our service! We hope you had a great experience.',
      color: '#6366f1',
      icon: '🎊'
    },
    cancelled: {
      title: '❌ Booking Cancelled',
      message: 'Your booking has been cancelled.',
      color: '#ef4444',
      icon: '❌'
    }
  };

  const config = statusConfig[newStatus] || statusConfig.confirmed;

  const mailOptions = {
    from: `"Service Booking" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `${config.title} - Service Booking Platform`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
          .status { color: ${config.color}; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.icon} ${config.title}</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>${config.message}</p>
            
            <div class="booking-details">
              <div class="detail-row"><strong>Service:</strong> ${service.name}</div>
              <div class="detail-row"><strong>Date:</strong> ${formattedDate}</div>
              <div class="detail-row"><strong>Time:</strong> ${timeSlot}</div>
              <div class="detail-row">
                <strong>Status:</strong> 
                <span class="status">${newStatus.toUpperCase()}</span>
              </div>
            </div>

            ${newStatus === 'confirmed' ? '<p><strong>🎉 You\'re all set!</strong> Please be ready 5 minutes before your scheduled time.</p>' : ''}
            ${newStatus === 'completed' ? '<p>We would love to hear your feedback! Please rate your experience.</p>' : ''}
            ${newStatus === 'cancelled' ? '<p>If you have any questions about this cancellation, please contact us.</p>' : ''}
            
            <p>Best regards,<br><strong>Service Booking Team</strong></p>
          </div>
          <div class="footer">
            <p>Contact us at ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email (${newStatus}) sent to: ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification
const sendAdminNotification = async (booking) => {
  const { user, service, bookingDate, timeSlot, totalPrice, address } = booking;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Service Booking" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: '🔔 New Booking Received - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: white; padding: 20px; margin-top: 10px; }
          .info-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .customer-info { background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .booking-info { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Booking Alert</h2>
          </div>
          <div class="content">
            <div class="info-box">
              <strong>⚠️ Action Required:</strong> A new booking is pending your approval.
            </div>

            <div class="customer-info">
              <h3>👤 Customer Information</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
              <p><strong>Address:</strong> ${address}</p>
            </div>

            <div class="booking-info">
              <h3>📋 Booking Details</h3>
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${timeSlot}</p>
              <p><strong>Duration:</strong> ${service.duration} minutes</p>
              <p><strong>Amount:</strong> $${totalPrice.toFixed(2)}</p>
            </div>

            <p><strong>📌 Next Steps:</strong></p>
            <ol>
              <li>Log in to the admin panel</li>
              <li>Review the booking details</li>
              <li>Confirm or reject the booking</li>
            </ol>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/admin/bookings" 
                 style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View in Admin Panel
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Admin email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendStatusUpdateEmail,
  sendAdminNotification
};