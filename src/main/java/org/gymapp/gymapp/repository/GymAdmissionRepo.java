package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.GymAdmission;
import org.gymapp.gymapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GymAdmissionRepo extends JpaRepository<GymAdmission, Long> {
    List<GymAdmission> findByUserOrderByStartTimeDesc(User user);
}
