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

-- Table: TrainingPlans
CREATE TABLE TrainingPlans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    user_id INTEGER REFERENCES Users(id) NOT NULL ON DELETE CASCADE,
    created_by INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Workouts
CREATE TABLE Workouts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    user_id INTEGER REFERENCES Users(id) NOT NULL ON DELETE CASCADE,
    training_plan_id INTEGER REFERENCES TrainingPlans(id) NOT NULL ON DELETE CASCADE,
    created_by INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: ExerciseIcons
CREATE TABLE ExerciseIcons (
    id SERIAL PRIMARY KEY,
    icon_name VARCHAR(50),
    avatar BYTEA
);

-- Table: Exercises
CREATE TABLE Exercises (
    id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES Users(id) NOT NULL ON DELETE CASCADE,
    created_by INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    icon_id INTEGER REFERENCES ExerciseIcons(id) ON DELETE SET NULL
);

-- Table: ExerciseSetNumbers
CREATE TABLE ExerciseSetNumbers (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER REFERENCES Exercises(id) NOT NULL ON DELETE CASCADE,
    workout_id INTEGER REFERENCES Workouts(id) NOT NULL ON DELETE CASCADE,
    number_of_sets SMALLINT
);

-- Table: ExerciseSets
CREATE TABLE ExerciseSets (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES ExerciseSetNumbers(id) NOT NULL ON DELETE CASCADE,
    workout_id INTEGER REFERENCES Workouts(id) NOT NULL ON DELETE CASCADE,
    number_of_reps SMALLINT,
    weight_for_set SMALLINT,
    duration INTERVAL 
);

-- Table: TrainingLogs
CREATE TABLE TrainingLogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    workout_id INTEGER REFERENCES Workouts(id) ON DELETE SET NULL,
    date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content JSON
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