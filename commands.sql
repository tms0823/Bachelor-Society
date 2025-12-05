CREATE DATABASE bachelor_db;
use bachelor_db; 

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15),
  password VARCHAR(255)
);

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255),
  age INT,
  gender VARCHAR(50),
  occupation VARCHAR(255),
  location VARCHAR(255),
  budget DECIMAL(10, 2),
  interests TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE housing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  rent DECIMAL(10, 2),
  num_rooms INT,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
