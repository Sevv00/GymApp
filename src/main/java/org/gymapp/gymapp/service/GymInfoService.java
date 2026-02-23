package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.GymInfoDTO;
import org.gymapp.gymapp.dto.GymInfoUpdateRequest;
import org.gymapp.gymapp.model.GymInfo;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.repository.GymInfoRepo;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GymInfoService {

    private final GymInfoRepo gymInfoRepo;
    private final UserRepo userRepo;

    public GymInfoDTO getGymInfo() {
        GymInfo info = gymInfoRepo.findById(1L).orElse(null);
        if (info == null) {
            // Return empty DTO if no info yet
            return new GymInfoDTO();
        }
        return mapToDTO(info);
    }

    public GymInfoDTO updateGymInfo(GymInfoUpdateRequest request, String employeeEmail) {
        User employee = userRepo.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        GymInfo info = gymInfoRepo.findById(1L).orElse(new GymInfo());
        info.setId(1L);

        if (request.getOpeningHours() != null) info.setOpeningHours(request.getOpeningHours());
        if (request.getGymDesc() != null) info.setGymDesc(request.getGymDesc());
        if (request.getFirstPhoneNumber() != null) info.setFirstPhoneNumber(request.getFirstPhoneNumber());
        if (request.getSecondPhoneNumber() != null) info.setSecondPhoneNumber(request.getSecondPhoneNumber());
        if (request.getFirstEmail() != null) info.setFirstEmail(request.getFirstEmail());
        if (request.getSecondEmail() != null) info.setSecondEmail(request.getSecondEmail());

        info.setUpdatedBy(employee);
        info.setUpdatedAt(LocalDateTime.now());

        gymInfoRepo.save(info);
        return mapToDTO(info);
    }

    private GymInfoDTO mapToDTO(GymInfo info) {
        GymInfoDTO dto = new GymInfoDTO();
        dto.setId(info.getId());
        dto.setOpeningHours(info.getOpeningHours());
        dto.setGymDesc(info.getGymDesc());
        dto.setFirstPhoneNumber(info.getFirstPhoneNumber());
        dto.setSecondPhoneNumber(info.getSecondPhoneNumber());
        dto.setFirstEmail(info.getFirstEmail());
        dto.setSecondEmail(info.getSecondEmail());
        dto.setUpdatedAt(info.getUpdatedAt());
        if (info.getUpdatedBy() != null) {
            dto.setUpdatedByName(info.getUpdatedBy().getFirstName() + " " + info.getUpdatedBy().getLastName());
        }
        return dto;
    }
}
