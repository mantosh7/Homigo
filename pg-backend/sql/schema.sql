CREATE TABLE IF NOT EXISTS pgs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pg_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pg_id INT NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type ENUM(
    'single (AC)',
    'single (Non AC)',
    'double (AC)',
    'double (Non AC)',
    'triple (AC)',
    'triple (Non AC)'
  ) DEFAULT 'single (AC)',
  capacity INT DEFAULT 1,
  floor VARCHAR(50),
  monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_occupied TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
  UNIQUE (pg_id, room_number)
);		

CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pg_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  room_id INT NULL,
  join_date DATE,
  emergency_contact VARCHAR(50),
  permanent_address TEXT,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rent_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pg_id INT NOT NULL,
  tenant_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Pending','Paid','Overdue')
  DEFAULT 'Pending',
  date_paid DATETIME NULL,
  due_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pg_id INT NOT NULL,
  tenant_id INT NOT NULL,
  room_id INT NULL,
  title VARCHAR(200),
  description TEXT,
  priority ENUM('Low','Medium','High')
  DEFAULT 'Medium',
  status ENUM(
    'Pending',
    'Verified',
    'In Progress',
    'Resolved'
  ) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_email_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);