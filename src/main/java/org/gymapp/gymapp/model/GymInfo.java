package org.gymapp.gymapp.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

//Singleton
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "GymInfo")
public class GymInfo {
    @Id
    @Column(name = "id", nullable = false, updatable = false, unique = true)
    private Long id = 1L; // Singleton ID

    @Lob
    @Column(name = "opening_hours")
    private String openingHours;

    @Lob
    @Column(name = "gym_desc")
    private String gymDesc;

    @Column(name = "phone_number_1", length = 15, nullable = false)
    private String firstPhoneNumber;

    @Column(name = "phone_number_2", length = 15)
    private String secondPhoneNumber;

    @Column(name = "email_1", nullable = false)
    private String firstEmail;

    @Column(name = "email_2")
    private String secondEmail;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }
}
