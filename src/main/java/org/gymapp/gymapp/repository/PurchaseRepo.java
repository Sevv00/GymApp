package org.gymapp.gymapp.repository;

import org.gymapp.gymapp.model.Purchase;
import org.gymapp.gymapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepo extends JpaRepository<Purchase, Long> {
    List<Purchase> findByBuyerOrderByPurchaseDateDesc(User buyer);
}
