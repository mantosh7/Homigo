-- Run this to create DB schema (MySQL)

CREATE DATABASE IF NOT EXISTS pg_manager;
USE pg_manager;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_type ENUM('Single','Double','AC','Non-AC') DEFAULT 'Single',
  capacity INT DEFAULT 1,
  floor VARCHAR(50),
  monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_occupied TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  room_id INT NULL,
  join_date DATE,
  emergency_contact VARCHAR(50),
  permanent_address TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Rents
CREATE TABLE IF NOT EXISTS rents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  month TINYINT NOT NULL,
  year SMALLINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Pending','Paid','Overdue') DEFAULT 'Pending',
  date_paid DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tenant_month_year (tenant_id, month, year),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NULL,
  category VARCHAR(100),
  priority ENUM('Low','Medium','High') DEFAULT 'Medium',
  title VARCHAR(200),
  description TEXT,
  status ENUM('Pending','Verified','In Progress','Resolved') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- OTP Table Admin
CREATE TABLE admin_email_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rents_status ON rents(status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_rooms_occupied ON rooms(is_occupied);
