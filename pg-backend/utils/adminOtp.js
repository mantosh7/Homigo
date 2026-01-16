const pool = require("../db");

function saveAdminOtp(email, otp) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const query = `
    INSERT INTO admin_email_otps (email, otp, expires_at)
    VALUES (?, ?, ?)
  `;
  return pool.query(query, [email, otp, expiresAt]);
}

function verifyAdminOtp(email, otp) {
  const query = `
    SELECT * FROM admin_email_otps
    WHERE email = ? AND otp = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return pool.query(query, [email, otp]);
}

function deleteAdminOTP(email)
{
  const query = `
    DELETE FROM admin_email_otps
    WHERE email = ?  
  `;
  return pool.query(query, [email]) ;

}


module.exports = {saveAdminOtp, verifyAdminOtp, deleteAdminOTP} ;
