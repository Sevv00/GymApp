package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.GuestAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestActionRepo extends JpaRepository<GuestAction, Long> {
}
