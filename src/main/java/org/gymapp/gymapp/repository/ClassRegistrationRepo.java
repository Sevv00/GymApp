package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.ClassRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRegistrationRepo extends JpaRepository<ClassRegistration, Long> {
}
