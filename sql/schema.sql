-- Schema for Bachelor_Society

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  age INT,
  gender VARCHAR(50),
  occupation VARCHAR(255),
  preferred_location VARCHAR(255),
  budget_min INT,
  budget_max INT,
  interests TEXT,
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS housing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  address VARCHAR(500) NOT NULL,
  area VARCHAR(255),
  rent DECIMAL(10,2) NOT NULL,
  available_from DATE,
  rooms INT,
  property_type ENUM('apartment', 'house', 'room', 'studio') DEFAULT 'apartment',
  gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
  lease_duration_months INT DEFAULT 12,
  allowed_residents ENUM('students', 'working', 'families', 'anyone') DEFAULT 'anyone',
  smoking_allowed BOOLEAN DEFAULT TRUE,
  pets_allowed BOOLEAN DEFAULT TRUE,
  religion_preference VARCHAR(100),
  university_preference VARCHAR(255),
  max_occupants INT,
  photos JSON,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS buddies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT,
  activity_type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date_time DATETIME NOT NULL,
  description TEXT,
  max_participants INT DEFAULT 10,
  gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
  min_age INT DEFAULT 18,
  max_age INT DEFAULT 99,
  cost_per_person DECIMAL(8,2) DEFAULT 0,
  photos JSON,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS buddy_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buddy_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('interested', 'joined', 'declined') DEFAULT 'interested',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buddy_id) REFERENCES buddies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_buddy_user (buddy_id, user_id),
  KEY idx_buddy_user (buddy_id, user_id),
  KEY idx_status (status)
);







CREATE TABLE IF NOT EXISTS roommate_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT,
  preferred_location VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  lifestyle TEXT,
  move_in_date DATE,
  description TEXT,
  gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
  room_type ENUM('private_room', 'shared_room', 'any') DEFAULT 'any',
  lease_duration_preference INT DEFAULT 12,
  occupation VARCHAR(100),
  smoking_preference ENUM('non_smoker', 'occasional', 'regular', 'any') DEFAULT 'any',
  religion VARCHAR(100),
  pet_preference ENUM('no_pets', 'cats_ok', 'dogs_ok', 'any_pets') DEFAULT 'any_pets',
  max_roommates INT DEFAULT 1,
  photos JSON,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  related_type VARCHAR(50),
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
