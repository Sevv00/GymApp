package org.gymapp.gymapp.service;

import lombok.RequiredArgsConstructor;
import org.gymapp.gymapp.dto.AnnouncementCreateRequest;
import org.gymapp.gymapp.dto.AnnouncementDTO;
import org.gymapp.gymapp.model.Announcement;
import org.gymapp.gymapp.model.User;
import org.gymapp.gymapp.repository.AnnouncementRepo;
import org.gymapp.gymapp.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepo announcementRepo;
    private final UserRepo userRepo;

    public List<AnnouncementDTO> getActiveAnnouncements() {
        return announcementRepo.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public AnnouncementDTO createAnnouncement(AnnouncementCreateRequest request, String employeeEmail) {
        User employee = userRepo.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setEmployee(employee);

        announcementRepo.save(announcement);
        return mapToDTO(announcement);
    }

    public AnnouncementDTO updateAnnouncement(Long id, AnnouncementCreateRequest request) {
        Announcement announcement = announcementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ogłoszenie nie znalezione"));

        if (request.getTitle() != null) announcement.setTitle(request.getTitle());
        if (request.getContent() != null) announcement.setContent(request.getContent());

        announcementRepo.save(announcement);
        return mapToDTO(announcement);
    }

    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ogłoszenie nie znalezione"));
        announcement.setIsActive(false);
        announcementRepo.save(announcement);
    }

    private AnnouncementDTO mapToDTO(Announcement a) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setIsActive(a.getIsActive());
        if (a.getEmployee() != null) {
            dto.setAuthorName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName());
        }
        return dto;
    }
}
