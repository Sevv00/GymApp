package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.ClassEntity;
import org.gymapp.gymapp.model.ClassRegistration;
import org.gymapp.gymapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRegistrationRepo extends JpaRepository<ClassRegistration, Long> {
    Optional<ClassRegistration> findByRegistredUserAndClassEntity(User user, ClassEntity classEntity);
}
