package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassEntityRepo extends JpaRepository<ClassEntity, Long> {
    ClassEntity findById(long id);
}
