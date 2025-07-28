package org.gymapp.gymapp.model;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false, updatable = false)
    private Long id;

    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "phone_number", unique = true, length = 15)
    private String phoneNumber;

    @Column(name = "hashed_password", nullable = false)
    private String password;

    @Column(name = "first_name", length = 25)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole userRole;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_logged_in_date")
    private LocalDateTime lastLoggedInDate;

    @Column(name = "is_google")
    private Boolean isGoogle = false;

    @Column(name = "discount", nullable = false)
    private UserDiscount discount;

    @Column(name = "ad_agreement")
    private Boolean adAgreement = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "avatar")
    private byte[] avatar;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Offer> purchases = new HashSet<>();

    @OneToMany(mappedBy = "instructorId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ClassEntity> employeeClasses = new HashSet<>();

    @OneToMany(mappedBy = "registredUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ClassRegistration> customerClasses = new HashSet<>();

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Purchase> customerPurchases = new HashSet<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Announcement> employeeAnnouncements = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastLoggedInDate = LocalDateTime.now();
    }
}
