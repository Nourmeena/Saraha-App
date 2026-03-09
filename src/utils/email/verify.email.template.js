export const verifyEmailTemplate = ({
  otp = "",
  link = "",
  appName = "Saraha",
} = {}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          
          <table width="500px" cellpadding="0" cellspacing="0" border="0"
            style="background:#ffffff;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.08);padding:40px;">
            
            <!-- App Name -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;color:#6C63FF;font-size:28px;">
                  ${appName}
                </h2>
                <p style="margin:5px 0 0;color:#888;font-size:14px;">
                  Anonymous Messages. Honest Feedback.
                </p>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center" style="padding:20px 0;">
                <h1 style="margin:0;color:#333;font-size:22px;">
                  Verify Your Email
                </h1>
              </td>
            </tr>

            <!-- Description -->
            <tr>
              <td align="center">
                <p style="color:#555;font-size:15px;line-height:1.6;padding:0 20px;">
                  Use the verification code below to confirm your email.
                </p>
              </td>
            </tr>

            <!-- OTP CODE -->
            <tr>
              <td align="center" style="padding:25px 0;">
                <div style="
                  font-size:32px;
                  letter-spacing:8px;
                  font-weight:bold;
                  color:#6C63FF;
                  background:#f0f2ff;
                  padding:15px 25px;
                  border-radius:10px;
                  display:inline-block;">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- OR Divider -->
            <tr>
              <td align="center">
                <p style="color:#aaa;font-size:13px;">
                  OR
                </p>
              </td>
            </tr>

            <!-- Verify Button -->
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${link}" 
                  style="background:linear-gradient(90deg,#6C63FF,#5A54E8);
                         color:#ffffff;
                         text-decoration:none;
                         padding:14px 35px;
                         border-radius:30px;
                         font-size:16px;
                         font-weight:bold;
                         display:inline-block;">
                  Verify via Link
                </a>
              </td>
            </tr>

            <!-- Footer Note -->
            <tr>
              <td align="center">
                <p style="color:#999;font-size:13px;">
                  This code will expire in 10 minutes.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
