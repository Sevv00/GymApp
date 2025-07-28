Project GymApp {
  database_type: 'PostgreSQL'
}

Table Users {
  id SERIAL [pk]
  email VARCHAR(255) [unique, not null]
  phone_number VARCHAR(15) [unique]
  password_hash VARCHAR(255) [not null]
  first_name VARCHAR(25)
  last_name VARCHAR(50)
  user_role ENUM('ADMIN', 'EMPLOYEE', 'CLIENT') [not null]
  created_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  last_logged_in_date TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  is_google BOOLEAN [default: false]
  discount ENUM('NONE', 'STUDENT', 'MULTISPORT') [default: 'NONE']
  ad_agreement BOOLEAN [default: false]
  is_active BOOLEAN [default: true]
  avatar BYTEA
}

Table Offers {
  id SERIAL [pk]
  offer_name VARCHAR(100) [not null]
  offer_desc TEXT
  price_text VARCHAR(100)
  price NUMERIC(10,2) [not null]
  duration_days SMALLINT [not null]
  is_permanent BOOLEAN [not null]
  offer_expired_date TIMESTAMP
  created_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  created_by INT [ref: > Users.id]
  is_active BOOLEAN [default: true]
}

Table Classes {
  id SERIAL [pk] 
  offer_id INT [ref: > Offers.id, not null]
  start_time TIMESTAMP [not null]
  end_time TIMESTAMP [not null]
  instructor_id INT [ref: > Users.id]
  capacity INT [not null]
}

Table ClassRegistrations {
  id SERIAL [pk]
  user_id INT [ref: > Users.id]
  class_id INT [ref: > Classes.id]
  registered_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  is_active BOOLEAN [default: true]
}

Table Purchases {
  id SERIAL [pk]
  user_id INT [ref: > Users.id]
  offer_id INT [ref: > Offers.id]
  purchase_date TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  valid_until TIMESTAMP
}

Table GuestActions {
  id SERIAL [pk]
  first_name VARCHAR(25)
  last_name VARCHAR(50)
  email VARCHAR(255) [not null]
  phone_number VARCHAR(15)
  purchase_id INT [ref: > Purchases.id, not null]
  created_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
}

Table Announcements {
  id SERIAL [pk]
  employee_id INT [ref: > Users.id]
  title VARCHAR(255)
  content TEXT
  created_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
  is_active BOOLEAN [default: true]
}

Table GymInfo {
  id SERIAL [pk]
  opening_hours TEXT 
  gym_desc TEXT
  phone_number_1 VARCHAR(15) [not null]
  phone_number_2 VARCHAR(15)
  email_1 VARCHAR(255) [not null]
  email_2 VARCHAR(255)
  updated_by INT [ref: > Users.id, not null]
  updated_at TIMESTAMP [default: 'CURRENT_TIMESTAMP']
}