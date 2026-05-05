import nodemailer from 'nodemailer';

const emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
const emailSecure = emailPort === 465;

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailSecure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export interface GuestEmailData {
  guestName: string;
  guestEmail: string;
  eventName: string;
  eventLocation: string;
  startDate: string;
  endDate: string;
  qrCodeDataURL: string;
}

export const sendGuestInvitationEmail = async (emailData: GuestEmailData): Promise<void> => {
  try {
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Missing email configuration (EMAIL_HOST/EMAIL_USER/EMAIL_PASS)');
        }

        console.log(`Sending invitation email to ${emailData.guestEmail}...`);

    // Format date and time
    const eventDate = new Date(emailData.startDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .content {
                color: #333;
                line-height: 1.6;
            }
            .greeting {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #007bff;
            }
            .event-details {
                background-color: #f9f9f9;
                padding: 15px;
                border-left: 4px solid #007bff;
                margin: 20px 0;
                border-radius: 4px;
            }
            .event-details h3 {
                margin-top: 0;
                color: #007bff;
            }
            .detail-item {
                margin: 10px 0;
                font-size: 14px;
            }
            .detail-label {
                font-weight: bold;
                color: #555;
            }
            .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 4px;
            }
            .qr-section h3 {
                color: #007bff;
                margin-top: 0;
            }
            .qr-section p {
                color: #666;
                font-size: 14px;
                margin: 10px 0;
            }
            .qr-code {
                display: inline-block;
                padding: 10px;
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .qr-code img {
                width: 250px;
                height: 250px;
                display: block;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #999;
                font-size: 12px;
            }
            .cta-button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: bold;
            }
            .cta-button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 EventKonnect</h1>
                <p style="margin: 10px 0 0 0; color: #999;">Event Invitation</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Dear ${emailData.guestName},
                </div>

                <p>You have been successfully invited to attend the following event:</p>

                <div class="event-details">
                    <h3>${emailData.eventName}</h3>
                    <div class="detail-item">
                        <span class="detail-label">📍 Location:</span> ${emailData.eventLocation}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📅 Date:</span> ${formattedDate}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏰ Time:</span> ${formattedTime}
                    </div>
                </div>

                <p style="margin-top: 20px;">Please save and bring the QR code below to the event for check-in:</p>

                <div class="qr-section">
                    <h3>🔖 Your Unique Check-in QR Code</h3>
                    <p>This QR code is unique to you and linked to the event.</p>
                    <div class="qr-code">
                        <img src="cid:qrcode" alt="Check-in QR Code" />
                    </div>
                    <p>Simply present this code at the event entrance for seamless check-in.</p>
                </div>

                <p style="margin-top: 20px; color: #666;">
                    We're excited to see you at the event! If you have any questions, please don't hesitate to reach out.
                </p>

                <p style="margin-top: 20px;">
                    <strong>Thanks,</strong><br>
                    The EventKonnect Team
                </p>
            </div>

            <div class="footer">
                <p>
                    This is an automated message. Please do not reply to this email.<br>
                    &copy; 2026 EventKonnect. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email
    // Convert base64 data URL to buffer for attachment
    const base64Data = emailData.qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailData.guestEmail,
      subject: `🎉 You're Invited: ${emailData.eventName}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrBuffer,
          cid: 'qrcode', // same cid value as in the html img src
          contentType: 'image/png',
        },
      ],
    });

        console.log(`✅ Invitation email sent successfully to ${emailData.guestEmail} (${info.messageId})`);
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${emailData.guestEmail}:`, error.message);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

export const verifyEmailConfiguration = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};
