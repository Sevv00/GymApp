-- Enum Types
CREATE TYPE user_roles AS ENUM ('ADMIN', 'EMPLOYEE', 'CLIENT');
CREATE TYPE user_discounts AS ENUM('NONE', 'STUDENT', 'MULTISPORT');

-- Table: Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(25),
    last_name VARCHAR(50),
    user_role user_roles NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_logged_in_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_google BOOLEAN DEFAULT FALSE,
    discount user_discounts NOT NULL,
    ad_agreement BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar BYTEA
);

-- Table: Offers
CREATE TABLE Offers (
    id SERIAL PRIMARY KEY,
    offer_name VARCHAR(100) NOT NULL,
    offer_desc TEXT,
    price_text VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    duration_days SMALLINT NOT NULL,
    is_permanent BOOLEAN NOT NULL,
    offer_expired_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: Classes
-- Shared PK with Offers
CREATE TABLE Classes (
    id INTEGER PRIMARY KEY,
    offer_id INTEGER REFERENCES Offers(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    instructor_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    capacity INTEGER NOT NULL
);

-- Table: ClassRegistrations
CREATE TABLE ClassRegistrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES Classes(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, class_id) -- Prevent double bookings
);

-- Table: Purchases
CREATE TABLE Purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    offer_id INTEGER REFERENCES Offers(id) ON DELETE SET NULL,
    purchase_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITHOUT TIME ZONE
);

-- Table: GuestActions
CREATE TABLE GuestActions (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(25),
    last_name VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    purchase_id INTEGER REFERENCES Purchases(id) NOT NULL ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Announcements
CREATE TABLE Announcements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: GymInfo (singleton)
CREATE TABLE GymInfo (
    id SERIAL PRIMARY KEY,
    opening_hours TEXT,
    gym_desc TEXT,
    phone_number_1 VARCHAR(15) NOT NULL,
    phone_number_2 VARCHAR(15),
    email_1 VARCHAR(255) NOT NULL,
    email_2 VARCHAR(255),
    updated_by INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: GymAdmissions
CREATE TABLE GymAdmissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE ,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL
)

-- Table: Messeges
CREATE TABLE Messeges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE ,
    sent_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    content TEXT NOT NULL
)