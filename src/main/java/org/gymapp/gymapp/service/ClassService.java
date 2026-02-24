package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.ClassCreateRequest;
import org.gymapp.gymapp.dto.ClassDTO;
import org.gymapp.gymapp.model.ClassEntity;
import org.gymapp.gymapp.model.ClassRegistration;
import org.gymapp.gymapp.model.Offer;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.repository.ClassEntityRepo;
import org.gymapp.gymapp.repository.ClassRegistrationRepo;
import org.gymapp.gymapp.repository.OfferRepo;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassEntityRepo classEntityRepo;
    private final ClassRegistrationRepo classRegistrationRepo;
    private final OfferRepo offerRepo;
    private final UserRepo userRepo;

    public List<ClassDTO> getAllClasses() {
        return classEntityRepo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ClassDTO createClass(ClassCreateRequest request) {
        Offer offer = offerRepo.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Oferta nie znaleziona"));

        ClassEntity classEntity = new ClassEntity();
        classEntity.setOffer(offer);
        classEntity.setStartTime(request.getStartTime());
        classEntity.setEndTime(request.getEndTime());
        classEntity.setCapacity(request.getCapacity());

        if (request.getInstructorId() != null) {
            User instructor = userRepo.findById(request.getInstructorId().longValue())
                    .orElseThrow(() -> new RuntimeException("Instruktor nie znaleziony"));
            classEntity.setInstructorId(instructor);
        }

        classEntityRepo.save(classEntity);
        return mapToDTO(classEntity);
    }

    public ClassDTO updateClass(Long id, ClassCreateRequest request) {
        ClassEntity classEntity = classEntityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Zajęcia nie znalezione"));

        if (request.getStartTime() != null) classEntity.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) classEntity.setEndTime(request.getEndTime());
        if (request.getCapacity() != null) classEntity.setCapacity(request.getCapacity());
        if (request.getInstructorId() != null) {
            User instructor = userRepo.findById(request.getInstructorId().longValue())
                    .orElseThrow(() -> new RuntimeException("Instruktor nie znaleziony"));
            classEntity.setInstructorId(instructor);
        }

        classEntityRepo.save(classEntity);
        return mapToDTO(classEntity);
    }

    public void deleteClass(Long id) {
        classEntityRepo.deleteById(id);
    }

    public void registerForClass(Long classId, String userEmail) {
        ClassEntity classEntity = classEntityRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Zajęcia nie znalezione"));

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        long activeRegistrations = classEntity.getClassRegistrations().stream()
                .filter(ClassRegistration::getIsActive).count();

        if (activeRegistrations >= classEntity.getCapacity()) {
            throw new RuntimeException("Brak wolnych miejsc na zajęciach");
        }

        boolean alreadyRegistered = classEntity.getClassRegistrations().stream()
                .anyMatch(r -> r.getRegistredUser().getId().equals(user.getId()) && r.getIsActive());

        if (alreadyRegistered) {
            throw new RuntimeException("Już jesteś zapisany na te zajęcia");
        }

        ClassRegistration registration = new ClassRegistration();
        registration.setRegistredUser(user);
        registration.setClassEntity(classEntity);
        registration.setIsActive(true);

        classRegistrationRepo.save(registration);
    }

    public void unregisterFromClass(Long classId, String userEmail) {
        ClassEntity classEntity = classEntityRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Zajęcia nie znalezione"));

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        classEntity.getClassRegistrations().stream()
                .filter(r -> r.getRegistredUser().getId().equals(user.getId()) && r.getIsActive())
                .findFirst()
                .ifPresent(r -> {
                    r.setIsActive(false);
                    classRegistrationRepo.save(r);
                });
    }

    private ClassDTO mapToDTO(ClassEntity ce) {
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
        dto.setRegisteredCount(ce.getClassRegistrations() != null ?
                (int) ce.getClassRegistrations().stream().filter(ClassRegistration::getIsActive).count() : 0);
        return dto;
    }
}
