package org.gymapp.gymapp.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "Offers")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false, updatable = false)
    private Long id;

    @Column(name = "offer_name", nullable = false, length = 100)
    private String offerName;

    @Column(name = "offer_desc")
    private String offerDescription;

    @Column(name = "price_text", length = 100)
    private String priceText;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Short durationDays;

    @Column(name = "is_permanent", nullable = false)
    private Boolean isPermanent;

    @Column(name = "offer_expired_date")
    private LocalDateTime offerExpiredDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdBy;

    @Column(name = "is_active")
    private Boolean isActive = true;

    //Delete this if a bidirectional relation with Class is not needed
    @OneToOne(mappedBy = "offer", cascade = CascadeType.ALL)
    private ClassEntity classEntity;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Purchase> offerPurchases = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
