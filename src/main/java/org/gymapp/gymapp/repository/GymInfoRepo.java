package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.GymInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GymInfoRepo extends JpaRepository<GymInfo, Long> {
}
