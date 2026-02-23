package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.OfferCreateRequest;
import org.gymapp.gymapp.dto.OfferDTO;
import org.gymapp.gymapp.dto.ClassDTO;
import org.gymapp.gymapp.model.ClassEntity;
import org.gymapp.gymapp.model.Offer;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.repository.OfferRepo;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepo offerRepo;
    private final UserRepo userRepo;

    public List<OfferDTO> getActiveOffers() {
        return offerRepo.findAll().stream()
                .filter(o -> o.getIsActive() != null && o.getIsActive())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<OfferDTO> getAllOffers() {
        return offerRepo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public OfferDTO getOfferById(Long id) {
        Offer offer = offerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));
        return mapToDTO(offer);
    }

    public OfferDTO createOffer(OfferCreateRequest request, String employeeEmail) {
        User employee = userRepo.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Offer offer = new Offer();
        offer.setOfferName(request.getOfferName());
        offer.setOfferDescription(request.getOfferDescription());
        offer.setPriceText(request.getPriceText());
        offer.setPrice(request.getPrice());
        offer.setDurationDays(request.getDurationDays());
        offer.setIsPermanent(request.getIsPermanent());
        offer.setOfferExpiredDate(request.getOfferExpiredDate());
        offer.setCreatedBy(employee);
        offer.setIsActive(true);

        offerRepo.save(offer);
        return mapToDTO(offer);
    }

    public OfferDTO updateOffer(Long id, OfferCreateRequest request) {
        Offer offer = offerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));

        if (request.getOfferName() != null) offer.setOfferName(request.getOfferName());
        if (request.getOfferDescription() != null) offer.setOfferDescription(request.getOfferDescription());
        if (request.getPriceText() != null) offer.setPriceText(request.getPriceText());
        if (request.getPrice() != null) offer.setPrice(request.getPrice());
        if (request.getDurationDays() != null) offer.setDurationDays(request.getDurationDays());
        if (request.getIsPermanent() != null) offer.setIsPermanent(request.getIsPermanent());
        if (request.getOfferExpiredDate() != null) offer.setOfferExpiredDate(request.getOfferExpiredDate());

        offerRepo.save(offer);
        return mapToDTO(offer);
    }

    public void deleteOffer(Long id) {
        Offer offer = offerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));
        offer.setIsActive(false);
        offerRepo.save(offer);
    }

    private OfferDTO mapToDTO(Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setId(offer.getId());
        dto.setOfferName(offer.getOfferName());
        dto.setOfferDescription(offer.getOfferDescription());
        dto.setPriceText(offer.getPriceText());
        dto.setPrice(offer.getPrice());
        dto.setDurationDays(offer.getDurationDays());
        dto.setIsPermanent(offer.getIsPermanent());
        dto.setOfferExpiredDate(offer.getOfferExpiredDate());
        dto.setCreatedAt(offer.getCreatedAt());
        dto.setIsActive(offer.getIsActive());

        if (offer.getCreatedBy() != null) {
            dto.setCreatedById(offer.getCreatedBy().getId());
            dto.setCreatedByName(offer.getCreatedBy().getFirstName() + " " + offer.getCreatedBy().getLastName());
        }

        if (offer.getClassEntity() != null) {
            dto.setClassInfo(mapClassToDTO(offer.getClassEntity()));
        }

        return dto;
    }

    private ClassDTO mapClassToDTO(ClassEntity ce) {
        ClassDTO dto = new ClassDTO();
        dto.setId(ce.getId());
        if (ce.getOffer() != null) {
            dto.setOfferId(ce.getOffer().getId());
            dto.setOfferName(ce.getOffer().getOfferName());
        }
        dto.setStartTime(ce.getStartTime());
        dto.setEndTime(ce.getEndTime());
        dto.setCapacity(ce.getCapacity());
        if (ce.getInstructorId() != null) {
            dto.setInstructorId(ce.getInstructorId().getId());
            dto.setInstructorName(ce.getInstructorId().getFirstName() + " " + ce.getInstructorId().getLastName());
        }
        dto.setRegisteredCount(ce.getClassRegistrations() != null ? (int) ce.getClassRegistrations().stream().filter(r -> r.getIsActive()).count() : 0);
        return dto;
    }
}
