package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferRepo extends JpaRepository<Offer, Long> {
    Offer findById(long id);
}
