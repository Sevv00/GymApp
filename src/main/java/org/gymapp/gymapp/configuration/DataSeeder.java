package org.gymapp.gymapp.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.gymapp.gymapp.model.*;
import org.gymapp.gymapp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Skrypt seedujący bazę danych przykładowymi danymi.
 * Uruchamia się TYLKO z profilem "seed":
 *   java -jar app.jar --spring.profiles.active=seed
 *   lub w docker-compose: SPRING_PROFILES_ACTIVE=seed
 * Hasło do WSZYSTKICH kont testowych: Password123!
 */
@Slf4j
@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final OfferRepo offerRepo;
    private final ClassEntityRepo classEntityRepo;
    private final ClassRegistrationRepo classRegistrationRepo;
    private final PurchaseRepo purchaseRepo;
    private final AnnouncementRepo announcementRepo;
    private final GymInfoRepo gymInfoRepo;
    private final GymAdmissionRepo gymAdmissionRepo;
    private final MessageRepo messageRepo;
    private final GuestActionRepo guestActionRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Baza danych już zawiera dane — pomijam seedowanie.");
            return;
        }

        log.info("Rozpoczynam seedowanie bazy danych...");

        String hashedPassword = passwordEncoder.encode("Password123!");

        User admin = createUser("admin@gymapp.pl", "500100200", hashedPassword,
                "Tomasz", "Wiśniewski", UserRole.ADMIN, UserDiscount.NONE);

        User employee1 = createUser("jan.kowalski@gymapp.pl", "501200300", hashedPassword,
                "Jan", "Kowalski", UserRole.EMPLOYEE, UserDiscount.NONE);

        User employee2 = createUser("anna.nowak@gymapp.pl", "502300400", hashedPassword,
                "Anna", "Nowak", UserRole.EMPLOYEE, UserDiscount.NONE);

        User client1 = createUser("marek.zielinski@gmail.com", "600100200", hashedPassword,
                "Marek", "Zieliński", UserRole.CLIENT, UserDiscount.NONE);

        User client2 = createUser("kasia.wojcik@gmail.com", "600200300", hashedPassword,
                "Katarzyna", "Wójcik", UserRole.CLIENT, UserDiscount.STUDENT);

        User client3 = createUser("pawel.lewandowski@gmail.com", "600300400", hashedPassword,
                "Paweł", "Lewandowski", UserRole.CLIENT, UserDiscount.MULTISPORT);

        User client4 = createUser("ewa.kaminska@gmail.com", "600400500", hashedPassword,
                "Ewa", "Kamińska", UserRole.CLIENT, UserDiscount.NONE);

        User client5 = createUser("piotr.szymanski@gmail.com", "600500600", hashedPassword,
                "Piotr", "Szymański", UserRole.CLIENT, UserDiscount.STUDENT);

        List<User> savedUsers = userRepo.saveAll(
                List.of(admin, employee1, employee2, client1, client2, client3, client4, client5));
        log.info("Dodano {} użytkowników.", savedUsers.size());

        // Odśwież referencje po zapisie
        admin = savedUsers.get(0);
        employee1 = savedUsers.get(1);
        employee2 = savedUsers.get(2);
        client1 = savedUsers.get(3);
        client2 = savedUsers.get(4);
        client3 = savedUsers.get(5);
        client4 = savedUsers.get(6);
        client5 = savedUsers.get(7);


        LocalDateTime now = LocalDateTime.now();

        // Karnety
        Offer karnetMiesięczny = createOffer("Karnet Miesięczny",
                "Pełny dostęp do siłowni i strefy cardio przez 30 dni. Bez ograniczeń godzinowych.",
                "149,99 zł / miesiąc", new BigDecimal("149.99"), (short) 30,
                true, null, admin);

        Offer karnetKwartalny = createOffer("Karnet Kwartalny",
                "Pełny dostęp do siłowni przez 90 dni. Oszczędź 10% w porównaniu do karnetu miesięcznego!",
                "404,97 zł / kwartał", new BigDecimal("404.97"), (short) 90,
                true, null, admin);

        Offer karnetRoczny = createOffer("Karnet Roczny",
                "Najlepsza wartość! Pełny dostęp do siłowni przez cały rok. Oszczędź 20%!",
                "1 439,90 zł / rok", new BigDecimal("1439.90"), (short) 365,
                true, null, admin);

        Offer karnetStudencki = createOffer("Karnet Studencki",
                "Specjalna oferta dla studentów z ważną legitymacją. Pełny dostęp do siłowni.",
                "99,99 zł / miesiąc", new BigDecimal("99.99"), (short) 30,
                true, null, admin);

        Offer wejscieJednorazowe = createOffer("Wejście Jednorazowe",
                "Jednorazowe wejście na siłownię. Idealny wybór do przetestowania naszego klubu.",
                "29,99 zł", new BigDecimal("29.99"), (short) 1,
                true, null, admin);

        // Oferty na zajęcia grupowe
        Offer ofertaYoga = createOffer("Yoga — Poranny Relaks",
                "Zajęcia jogi prowadzone przez certyfikowanego instruktora. Idealne na rozpoczęcie dnia!",
                "39,99 zł / zajęcia", new BigDecimal("39.99"), (short) 1,
                true, null, employee2);

        Offer ofertaCrossfit = createOffer("CrossFit — Wyzwanie",
                "Intensywny trening CrossFit. Podniesienie wydolności, siły i wytrzymałości.",
                "49,99 zł / zajęcia", new BigDecimal("49.99"), (short) 1,
                true, null, employee1);

        Offer ofertaSpinning = createOffer("Spinning — Jazda na Maxa",
                "Energetyczny trening na rowerach stacjonarnych z muzyką. Spalanie kalorów gwarantowane!",
                "34,99 zł / zajęcia", new BigDecimal("34.99"), (short) 1,
                true, null, employee1);

        Offer ofertaPilates = createOffer("Pilates — Zdrowy Kręgosłup",
                "Ćwiczenia wzmacniające mięśnie głębokie, poprawiające postawę i elastyczność.",
                "44,99 zł / zajęcia", new BigDecimal("44.99"), (short) 1,
                true, null, employee2);

        List<Offer> savedOffers = offerRepo.saveAll(
                List.of(karnetMiesięczny, karnetKwartalny, karnetRoczny, karnetStudencki,
                        wejscieJednorazowe, ofertaYoga, ofertaCrossfit, ofertaSpinning, ofertaPilates));
        log.info("Dodano {} ofert.", savedOffers.size());

        ofertaYoga = savedOffers.get(5);
        ofertaCrossfit = savedOffers.get(6);
        ofertaSpinning = savedOffers.get(7);
        ofertaPilates = savedOffers.get(8);
        karnetMiesięczny = savedOffers.get(0);
        karnetKwartalny = savedOffers.get(1);
        karnetRoczny = savedOffers.get(2);
        karnetStudencki = savedOffers.get(3);
        wejscieJednorazowe = savedOffers.get(4);


        ClassEntity yoga = createClassEntity(ofertaYoga,
                now.plusDays(1).withHour(7).withMinute(0).withSecond(0).withNano(0),
                now.plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0),
                employee2, 20);

        ClassEntity crossfit = createClassEntity(ofertaCrossfit,
                now.plusDays(1).withHour(17).withMinute(0).withSecond(0).withNano(0),
                now.plusDays(1).withHour(18).withMinute(0).withSecond(0).withNano(0),
                employee1, 15);

        ClassEntity spinning = createClassEntity(ofertaSpinning,
                now.plusDays(2).withHour(18).withMinute(30).withSecond(0).withNano(0),
                now.plusDays(2).withHour(19).withMinute(30).withSecond(0).withNano(0),
                employee1, 25);

        ClassEntity pilates = createClassEntity(ofertaPilates,
                now.plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0),
                now.plusDays(3).withHour(11).withMinute(0).withSecond(0).withNano(0),
                employee2, 18);

        List<ClassEntity> savedClasses = classEntityRepo.saveAll(List.of(yoga, crossfit, spinning, pilates));
        log.info("Dodano {} zajęć grupowych.", savedClasses.size());

        yoga = savedClasses.get(0);
        crossfit = savedClasses.get(1);
        spinning = savedClasses.get(2);
        pilates = savedClasses.get(3);


        ClassRegistration reg1 = createRegistration(client1, yoga);
        ClassRegistration reg2 = createRegistration(client2, yoga);
        ClassRegistration reg3 = createRegistration(client3, crossfit);
        ClassRegistration reg4 = createRegistration(client4, crossfit);
        ClassRegistration reg5 = createRegistration(client5, spinning);
        ClassRegistration reg6 = createRegistration(client1, spinning);
        ClassRegistration reg7 = createRegistration(client2, pilates);
        ClassRegistration reg8 = createRegistration(client4, pilates);

        classRegistrationRepo.saveAll(List.of(reg1, reg2, reg3, reg4, reg5, reg6, reg7, reg8));
        log.info("Dodano 8 rejestracji na zajęcia.");


        Purchase p1 = createPurchase(client1, karnetMiesięczny, now.minusDays(10), 30);
        Purchase p2 = createPurchase(client2, karnetStudencki, now.minusDays(5), 30);
        Purchase p3 = createPurchase(client3, karnetKwartalny, now.minusDays(60), 90);
        Purchase p4 = createPurchase(client4, karnetRoczny, now.minusDays(120), 365);
        Purchase p5 = createPurchase(client5, karnetStudencki, now.minusDays(15), 30);
        Purchase p6 = createPurchase(client1, wejscieJednorazowe, now.minusDays(30), 1);
        Purchase p7 = createPurchase(client2, ofertaYoga, now.minusDays(2), 1);
        Purchase p8 = createPurchase(client3, ofertaCrossfit, now.minusDays(1), 1);

        List<Purchase> savedPurchases = purchaseRepo.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8));
        log.info("Dodano {} zakupów.", savedPurchases.size());


        Announcement a1 = createAnnouncement(employee1,
                "Nowe godziny otwarcia!",
                "Od przyszłego tygodnia siłownia będzie czynna od 5:00 do 23:00! " +
                        "Rozszerzamy godziny otwarcia, aby lepiej dopasować się do Waszych potrzeb. " +
                        "Zapraszamy na poranne i wieczorne treningi!");

        Announcement a2 = createAnnouncement(employee2,
                "Promocja na karnety kwartalne!",
                "Tylko do końca miesiąca — karnet kwartalny w cenie 349,99 zł! " +
                        "To aż 15% taniej niż w standardowej ofercie. " +
                        "Nie przegap okazji, liczba miejsc ograniczona!");

        Announcement a3 = createAnnouncement(employee1,
                "Nowy instruktor CrossFit",
                "Z przyjemnością informujemy, że do naszego zespołu dołączył Jan Kowalski — " +
                        "certyfikowany instruktor CrossFit z 5-letnim doświadczeniem. " +
                        "Zapisy na zajęcia już otwarte!");

        Announcement a4 = createAnnouncement(admin,
                "Przerwa techniczna — 15 lipca",
                "Informujemy, że w dniu 15 lipca (sobota) siłownia będzie nieczynna " +
                        "z powodu prac konserwacyjnych systemu wentylacji. " +
                        "Przepraszamy za niedogodności. Zapraszamy ponownie w niedzielę!");

        announcementRepo.saveAll(List.of(a1, a2, a3, a4));
        log.info("Dodano 4 ogłoszenia.");


        GymInfo gymInfo = new GymInfo();
        gymInfo.setId(1L);
        gymInfo.setOpeningHours(
                "Poniedziałek - Piątek: 6:00 - 22:00\n" +
                "Sobota: 8:00 - 20:00\n" +
                "Niedziela: 9:00 - 18:00\n" +
                "Święta: NIECZYNNE");
        gymInfo.setGymDesc(
                "GymApp Fitness Club to nowoczesna siłownia zlokalizowana w centrum miasta. " +
                "Oferujemy ponad 500 m² powierzchni treningowej wyposażonej w najnowszy sprzęt " +
                "marek Technogym i Life Fitness. W naszej ofercie znajdziesz:\n\n" +
                "• Strefa siłowa z wolnymi ciężarami i maszynami\n" +
                "• Strefa cardio z bieżniami, orbitrekami i rowerami\n" +
                "• Sala do zajęć grupowych (yoga, pilates, CrossFit, spinning)\n" +
                "• Szatnie z prysznicami i saunami\n" +
                "• Strefa relaksu\n\n" +
                "Nasz wykwalifikowany zespół instruktorów pomoże Ci osiągnąć Twoje cele fitness!");
        gymInfo.setFirstPhoneNumber("+48 500 100 200");
        gymInfo.setSecondPhoneNumber("+48 500 100 201");
        gymInfo.setFirstEmail("kontakt@gymapp.pl");
        gymInfo.setSecondEmail("recepcja@gymapp.pl");
        gymInfo.setUpdatedBy(admin);
        gymInfo.setUpdatedAt(now);

        gymInfoRepo.save(gymInfo);
        log.info("Dodano informacje o siłowni.");


        GymAdmission ga1 = createAdmission(client1, now.minusDays(1).withHour(8).withMinute(0), now.minusDays(1).withHour(9).withMinute(30));
        GymAdmission ga2 = createAdmission(client1, now.minusDays(3).withHour(17).withMinute(15), now.minusDays(3).withHour(18).withMinute(45));
        GymAdmission ga3 = createAdmission(client2, now.minusDays(1).withHour(10).withMinute(0), now.minusDays(1).withHour(11).withMinute(15));
        GymAdmission ga4 = createAdmission(client2, now.minusDays(2).withHour(7).withMinute(0), now.minusDays(2).withHour(8).withMinute(0));
        GymAdmission ga5 = createAdmission(client3, now.minusDays(1).withHour(18).withMinute(0), now.minusDays(1).withHour(19).withMinute(30));
        GymAdmission ga6 = createAdmission(client3, now.minusDays(4).withHour(16).withMinute(0), now.minusDays(4).withHour(17).withMinute(45));
        GymAdmission ga7 = createAdmission(client4, now.minusDays(2).withHour(12).withMinute(0), now.minusDays(2).withHour(13).withMinute(30));
        GymAdmission ga8 = createAdmission(client4, now.minusDays(5).withHour(9).withMinute(0), now.minusDays(5).withHour(10).withMinute(0));
        GymAdmission ga9 = createAdmission(client5, now.minusDays(1).withHour(6).withMinute(0), now.minusDays(1).withHour(7).withMinute(15));
        GymAdmission ga10 = createAdmission(client5, now.minusDays(3).withHour(20).withMinute(0), now.minusDays(3).withHour(21).withMinute(30));
        GymAdmission ga11 = createAdmission(employee1, now.minusDays(1).withHour(7).withMinute(0), now.minusDays(1).withHour(15).withMinute(0));
        GymAdmission ga12 = createAdmission(employee2, now.minusDays(1).withHour(9).withMinute(0), now.minusDays(1).withHour(17).withMinute(0));

        gymAdmissionRepo.saveAll(List.of(ga1, ga2, ga3, ga4, ga5, ga6, ga7, ga8, ga9, ga10, ga11, ga12));
        log.info("Dodano 12 wejść na siłownię.");


        Message m1 = createMessage(client1,
                "Cześć! Czy jest możliwość zawieszenia karnetu na czas urlopu? Wyjeżdżam na 2 tygodnie.",
                now.minusDays(5));

        Message m2 = createMessage(client2,
                "Dzień dobry, chciałam zapytać czy na sali do jogi są dostępne maty, czy trzeba przynosić swoje?",
                now.minusDays(3));

        Message m3 = createMessage(client4,
                "Czy planujecie wprowadzenie zajęć z boksu? Byłoby super!",
                now.minusDays(2));

        Message m4 = createMessage(client5,
                "Hej, sauna w szatni męskiej nie działa od wczoraj. Czy jest planowana naprawa?",
                now.minusDays(1));

        Message m5 = createMessage(client3,
                "Bardzo fajne nowe zajęcia CrossFit! Instruktor jest rewelacyjny. Polecam wszystkim!",
                now.minusHours(12));

        messageRepo.saveAll(List.of(m1, m2, m3, m4, m5));
        log.info("Dodano 5 wiadomości.");


        Purchase guestPurchase1 = createPurchase(null, wejscieJednorazowe, now.minusDays(7), 1);
        Purchase guestPurchase2 = createPurchase(null, ofertaYoga, now.minusDays(3), 1);
        List<Purchase> guestPurchases = purchaseRepo.saveAll(List.of(guestPurchase1, guestPurchase2));

        GuestAction guest1 = new GuestAction();
        guest1.setFirstName("Michał");
        guest1.setLastName("Kaczmarek");
        guest1.setEmail("michal.kaczmarek@gmail.com");
        guest1.setPhoneNumber("700100200");
        guest1.setPurchaseId(guestPurchases.get(0));

        GuestAction guest2 = new GuestAction();
        guest2.setFirstName("Natalia");
        guest2.setLastName("Kowalczyk");
        guest2.setEmail("natalia.kowalczyk@gmail.com");
        guest2.setPhoneNumber("700200300");
        guest2.setPurchaseId(guestPurchases.get(1));

        guestActionRepo.saveAll(List.of(guest1, guest2));
        log.info("Dodano 2 akcje gości.");

        log.info("=== Seedowanie zakończone pomyślnie! ===");
        log.info("Dane logowania testowe:");
        log.info("  Admin:      admin@gymapp.pl / Password123!");
        log.info("  Pracownik:  jan.kowalski@gymapp.pl / Password123!");
        log.info("  Pracownik:  anna.nowak@gymapp.pl / Password123!");
        log.info("  Klient:     marek.zielinski@gmail.com / Password123!");
        log.info("  Klient:     kasia.wojcik@gmail.com / Password123!");
        log.info("  ... (wszystkie konta mają hasło: Password123!)");
    }


    private User createUser(String email, String phone, String hashedPassword,
                            String firstName, String lastName, UserRole role, UserDiscount discount) {
        User user = new User();
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setPassword(hashedPassword);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserRole(role);
        user.setDiscount(discount);
        user.setIsGoogle(false);
        user.setAdAgreement(true);
        user.setIsActive(true);
        return user;
    }

    private Offer createOffer(String name, String desc, String priceText,
                              BigDecimal price, short durationDays,
                              boolean isPermanent, LocalDateTime expiredDate, User createdBy) {
        Offer offer = new Offer();
        offer.setOfferName(name);
        offer.setOfferDescription(desc);
        offer.setPriceText(priceText);
        offer.setPrice(price);
        offer.setDurationDays(durationDays);
        offer.setIsPermanent(isPermanent);
        offer.setOfferExpiredDate(expiredDate);
        offer.setCreatedBy(createdBy);
        offer.setIsActive(true);
        return offer;
    }

    private ClassEntity createClassEntity(Offer offer, LocalDateTime start, LocalDateTime end,
                                          User instructor, int capacity) {
        ClassEntity classEntity = new ClassEntity();
        classEntity.setOffer(offer);
        classEntity.setStartTime(start);
        classEntity.setEndTime(end);
        classEntity.setInstructorId(instructor);
        classEntity.setCapacity(capacity);
        return classEntity;
    }

    private ClassRegistration createRegistration(User user, ClassEntity classEntity) {
        ClassRegistration reg = new ClassRegistration();
        reg.setRegistredUser(user);
        reg.setClassEntity(classEntity);
        reg.setIsActive(true);
        return reg;
    }

    private Purchase createPurchase(User buyer, Offer offer, LocalDateTime purchaseDate, int durationDays) {
        Purchase purchase = new Purchase();
        purchase.setBuyer(buyer);
        purchase.setOffer(offer);
        purchase.setPurchaseDate(purchaseDate);
        if (durationDays > 0) {
            purchase.setValidUntil(purchaseDate.plusDays(durationDays));
        }
        return purchase;
    }

    private Announcement createAnnouncement(User employee, String title, String content) {
        Announcement announcement = new Announcement();
        announcement.setEmployee(employee);
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setIsActive(true);
        return announcement;
    }

    private GymAdmission createAdmission(User user, LocalDateTime start, LocalDateTime end) {
        GymAdmission admission = new GymAdmission();
        admission.setUser(user);
        admission.setStartTime(start);
        admission.setEndTime(end);
        return admission;
    }

    private Message createMessage(User user, String content, LocalDateTime sentTime) {
        Message message = new Message();
        message.setUser(user);
        message.setContent(content);
        message.setSentTime(sentTime);
        return message;
    }
}
