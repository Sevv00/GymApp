package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.GymAdmissionDTO;
import org.gymapp.gymapp.dto.PurchaseCreateRequest;
import org.gymapp.gymapp.dto.PurchaseDTO;
import org.gymapp.gymapp.model.*;
import org.gymapp.gymapp.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepo purchaseRepo;
    private final OfferRepo offerRepo;
    private final UserRepo userRepo;
    private final GuestActionRepo guestActionRepo;
    private final GymAdmissionRepo gymAdmissionRepo;

    public PurchaseDTO createPurchase(PurchaseCreateRequest request, String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Offer offer = offerRepo.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));

        Purchase purchase = new Purchase();
        purchase.setBuyer(user);
        purchase.setOffer(offer);

        purchaseRepo.save(purchase);
        return mapToDTO(purchase);
    }

    public PurchaseDTO createGuestPurchase(PurchaseCreateRequest request) {
        Offer offer = offerRepo.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));

        Purchase purchase = new Purchase();
        purchase.setOffer(offer);
        purchaseRepo.save(purchase);

        GuestAction ga = new GuestAction();
        ga.setFirstName(request.getFirstName());
        ga.setLastName(request.getLastName());
        ga.setEmail(request.getEmail());
        ga.setPhoneNumber(request.getPhoneNumber());
        ga.setPurchaseId(purchase);
        guestActionRepo.save(ga);

        return mapToDTO(purchase);
    }

    public List<PurchaseDTO> getMyPurchases(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return purchaseRepo.findByBuyerOrderByPurchaseDateDesc(user)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<GymAdmissionDTO> getMyAdmissions(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return gymAdmissionRepo.findByUserOrderByStartTimeDesc(user)
                .stream().map(this::mapAdmissionToDTO).collect(Collectors.toList());
    }

    private PurchaseDTO mapToDTO(Purchase p) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(p.getId());
        dto.setPurchaseDate(p.getPurchaseDate());
        dto.setValidUntil(p.getValidUntil());
        if (p.getBuyer() != null) {
            dto.setUserId(p.getBuyer().getId());
            dto.setUserName(p.getBuyer().getFirstName() + " " + p.getBuyer().getLastName());
        }
        if (p.getOffer() != null) {
            dto.setOfferId(p.getOffer().getId());
            dto.setOfferName(p.getOffer().getOfferName());
        }
        return dto;
    }

    private GymAdmissionDTO mapAdmissionToDTO(GymAdmission a) {
        GymAdmissionDTO dto = new GymAdmissionDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        return dto;
    }
}
