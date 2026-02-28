# Dokumentacja projektu GymApp — katalog `src/`

## Spis treści

1. [Przegląd projektu](#1-przegląd-projektu)
2. [Struktura katalogów](#2-struktura-katalogów)
3. [Klasa główna aplikacji](#3-klasa-główna-aplikacji)
4. [Warstwa konfiguracji (`configuration`)](#4-warstwa-konfiguracji-configuration)
5. [Warstwa modeli / encji (`model`)](#5-warstwa-modeli--encji-model)
6. [Warstwa repozytoriów (`repository`)](#6-warstwa-repozytoriów-repository)
7. [Warstwa DTO (`dto`)](#7-warstwa-dto-dto)
8. [Warstwa serwisów (`service`)](#8-warstwa-serwisów-service)
9. [Warstwa kontrolerów (`controller`)](#9-warstwa-kontrolerów-controller)
10. [Zasoby (`resources`)](#10-zasoby-resources)
11. [Testy (`test`)](#11-testy-test)

---

## 1. Przegląd projektu

**GymApp** to aplikacja webowa typu REST API napisana w **Java 17+ / Spring Boot**. Służy do zarządzania siłownią — obsługuje użytkowników (klientów, pracowników, administratorów), oferty (karnety, wejściówki), zakupy, zajęcia grupowe, ogłoszenia oraz informacje o siłowni.

**Stos technologiczny:**
- Spring Boot (Web, Security, Data JPA)
- PostgreSQL (baza danych)
- JWT (uwierzytelnianie bezstanowe)
- Lombok (redukcja boilerplate)
- Docker (konteneryzacja)

---

## 2. Struktura katalogów

```
src/
├── main/
│   ├── java/org/gymapp/gymapp/
│   │   ├── GymAppApplication.java          ← Punkt wejścia aplikacji
│   │   ├── configuration/                   ← Konfiguracja bezpieczeństwa, JWT, seeder
│   │   ├── controller/                      ← Kontrolery REST API
│   │   ├── dto/                             ← Obiekty transferu danych (DTO)
│   │   ├── model/                           ← Encje JPA (mapowanie bazy danych)
│   │   ├── repository/                      ← Interfejsy repozytoriów Spring Data JPA
│   │   └── service/                         ← Logika biznesowa
│   └── resources/
│       └── application.properties           ← Konfiguracja aplikacji
└── test/
    └── java/org/gymapp/gymapp/
        └── GymAppApplicationTests.java      ← Test integracyjny
```

---

## 3. Klasa główna aplikacji

### `GymAppApplication.java`
**Pakiet:** `org.gymapp.gymapp`

Główna klasa startowa Spring Boot. Zawiera metodę `main()`, która uruchamia cały kontekst aplikacji za pomocą `SpringApplication.run()`. Adnotacja `@SpringBootApplication` łączy w sobie:
- `@Configuration` — klasa konfiguracyjna Springa
- `@EnableAutoConfiguration` — automatyczna konfiguracja na podstawie zależności
- `@ComponentScan` — skanowanie komponentów w pakiecie i podpakietach

---

## 4. Warstwa konfiguracji (`configuration`)

### `SecurityConfig.java`
**Pakiet:** `org.gymapp.gymapp.configuration`

Centralna konfiguracja Spring Security dla całej aplikacji. Odpowiada za:

- **Politykę CORS** — zezwala na żądania z `localhost:3000`, `localhost:5173` i `frontend:3000`
- **Wyłączenie CSRF** — aplikacja jest bezstanowa (REST API z JWT)
- **Zarządzanie sesjami** — tryb `STATELESS` (brak sesji HTTP)
- **Reguły autoryzacji endpointów:**
  - **Publiczne (bez logowania):** rejestracja, logowanie, pobieranie informacji o siłowni, ogłoszeń, ofert, zajęć, zakupy gościa
  - **Pracownik + Admin:** tworzenie/edycja/usuwanie ogłoszeń, ofert, zajęć, aktualizacja informacji o siłowni, zarządzanie wejściami
  - **Tylko Admin:** endpointy `/api/admin/**`
  - **Zalogowany użytkownik:** wszystkie pozostałe endpointy
- **Filtr JWT** — dodaje `JwtAuthFilter` przed standardowym filtrem uwierzytelniania
- **Bean `PasswordEncoder`** — BCrypt do hashowania haseł
- **Bean `AuthenticationManager`** — menedżer uwierzytelniania

---

### `JwtUtil.java`
**Pakiet:** `org.gymapp.gymapp.configuration`

Klasa narzędziowa do pracy z tokenami **JSON Web Token (JWT)**. Funkcjonalności:

| Metoda | Opis |
|--------|------|
| `generateToken(email, role)` | Tworzy token JWT z adresem e-mail jako `subject` i rolą w claimach. Ważność tokenu konfigurowana w `application.properties` (domyślnie 24h). |
| `extractEmail(token)` | Wyciąga adres e-mail (subject) z tokenu |
| `extractRole(token)` | Wyciąga rolę użytkownika z claimów tokenu |
| `isTokenValid(token, email)` | Sprawdza, czy token jest ważny (email się zgadza i token nie wygasł) |

Klucz podpisywania JWT jest ładowany z konfiguracji (`jwt.secret`) i musi mieć co najmniej 256 bitów (dla algorytmu HMAC-SHA).

---

### `JwtAuthFilter.java`
**Pakiet:** `org.gymapp.gymapp.configuration`

Filtr HTTP rozszerzający `OncePerRequestFilter`. Działa przy **każdym żądaniu HTTP** i odpowiada za:

1. Sprawdzenie nagłówka `Authorization` — czy zawiera token `Bearer <token>`
2. Ekstrakcję e-maila i roli użytkownika z tokenu JWT
3. Walidację tokenu
4. Ustawienie obiektu `Authentication` w `SecurityContextHolder` — od tego momentu Spring Security traktuje żądanie jako uwierzytelnione z odpowiednią rolą (`ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_CLIENT`)

Jeśli token jest nieprawidłowy lub brakuje nagłówka — żądanie przechodzi dalej bez uwierzytelnienia (endpointy publiczne nadal działają).

---

### `DataSeeder.java`
**Pakiet:** `org.gymapp.gymapp.configuration`

Klasa implementująca `CommandLineRunner`, uruchamiana **wyłącznie z profilem `seed`** (`@Profile("seed")`). Służy do wypełnienia bazy danych przykładowymi danymi testowymi. Tworzy:

- **8 użytkowników:** 1 admin, 2 pracowników, 5 klientów (hasło do wszystkich: `Password123!`)
- **9 ofert:** karnety (miesięczny, kwartalny, roczny, studencki), wejście jednorazowe, oferty na zajęcia grupowe (yoga, crossfit, spinning, pilates)
- **4 zajęcia grupowe** z przypisanymi instruktorami i pojemnością
- **8 rejestracji na zajęcia** — klienci zapisani na różne zajęcia
- **Zakupy** — przykładowe karnety kupione przez klientów
- **Ogłoszenia** — kilka aktywnych ogłoszeń
- **Informacje o siłowni** — godziny otwarcia, opis, kontakt
- **Wejścia na siłownię (admissions)** — przykładowe wizyty
- **Wiadomości** — przykładowe wiadomości użytkowników
- **Akcje gościa** — zakupy dokonane przez niezarejestrowanych użytkowników

Seeder jest idempotentny — sprawdza, czy baza już zawiera dane i pomija seedowanie, jeśli tak.

---

## 5. Warstwa modeli / encji (`model`)

### `User.java`
**Tabela:** `Users`

Główna encja użytkownika systemu. Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny (auto-generowany) |
| `email` | `String` | Adres e-mail (unikalny, wymagany) |
| `phoneNumber` | `String` | Numer telefonu (unikalny, max 15 znaków) |
| `password` | `String` | Zahashowane hasło (BCrypt) |
| `firstName` | `String` | Imię (max 25 znaków) |
| `lastName` | `String` | Nazwisko (max 50 znaków) |
| `userRole` | `UserRole` | Rola: `ADMIN`, `EMPLOYEE`, `CLIENT` |
| `createdAt` | `LocalDateTime` | Data utworzenia konta (auto-ustawiana) |
| `lastLoggedInDate` | `LocalDateTime` | Data ostatniego logowania |
| `isGoogle` | `Boolean` | Czy konto powiązane z Google |
| `discount` | `UserDiscount` | Typ zniżki: `NONE`, `STUDENT`, `MULTISPORT` |
| `adAgreement` | `Boolean` | Zgoda na reklamy |
| `isActive` | `Boolean` | Czy konto jest aktywne (soft delete) |
| `avatar` | `byte[]` | Avatar użytkownika (dane binarne) |

**Relacje:**
- `OneToMany` → `Offer` (oferty utworzone przez pracownika)
- `OneToMany` → `ClassEntity` (zajęcia prowadzone jako instruktor)
- `OneToMany` → `ClassRegistration` (rejestracje klienta na zajęcia)
- `OneToMany` → `Purchase` (zakupy klienta)
- `OneToMany` → `Announcement` (ogłoszenia dodane przez pracownika)
- `OneToMany` → `GymAdmission` (wejścia na siłownię)
- `OneToMany` → `Message` (wiadomości użytkownika)

---

### `UserRole.java`
**Typ:** `enum`

Definiuje role użytkowników w systemie:
- `ADMIN` — administrator (pełne uprawnienia)
- `EMPLOYEE` — pracownik siłowni (zarządzanie ofertami, zajęciami, ogłoszeniami)
- `CLIENT` — klient (przeglądanie, zakupy, rejestracja na zajęcia)

---

### `UserDiscount.java`
**Typ:** `enum`

Definiuje typy zniżek użytkowników:
- `NONE` — brak zniżki
- `STUDENT` — zniżka studencka
- `MULTISPORT` — karta Multisport

---

### `Offer.java`
**Tabela:** `Offers`

Encja reprezentująca ofertę siłowni (karnet, wejściówka, zajęcia grupowe). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny (auto-generowany) |
| `offerName` | `String` | Nazwa oferty (max 100 znaków) |
| `offerDescription` | `String` | Opis oferty |
| `priceText` | `String` | Tekstowa reprezentacja ceny (np. „149,99 zł / miesiąc") |
| `price` | `BigDecimal` | Cena numeryczna (precyzja 10, skala 2) |
| `durationDays` | `Short` | Czas trwania w dniach |
| `isPermanent` | `Boolean` | Czy oferta jest stała |
| `offerExpiredDate` | `LocalDateTime` | Data wygaśnięcia oferty |
| `createdAt` | `LocalDateTime` | Data utworzenia (auto) |
| `createdBy` | `User` | Pracownik, który utworzył ofertę |
| `isActive` | `Boolean` | Czy oferta jest aktywna (soft delete) |

**Relacje:**
- `ManyToOne` → `User` (twórca oferty)
- `OneToOne` → `ClassEntity` (powiązane zajęcia grupowe)
- `OneToMany` → `Purchase` (zakupy tej oferty)

---

### `ClassEntity.java`
**Tabela:** `Classes`

Encja reprezentująca zajęcia grupowe. Klucz główny współdzielony z `Offer` (`@MapsId`). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny (= `offer_id`) |
| `offer` | `Offer` | Powiązana oferta (relacja 1:1) |
| `startTime` | `LocalDateTime` | Czas rozpoczęcia zajęć |
| `endTime` | `LocalDateTime` | Czas zakończenia zajęć |
| `instructorId` | `User` | Instruktor prowadzący |
| `capacity` | `Integer` | Maksymalna liczba uczestników |

**Relacje:**
- `OneToOne` → `Offer` (oferta, z którą powiązane są zajęcia)
- `ManyToOne` → `User` (instruktor)
- `OneToMany` → `ClassRegistration` (rejestracje uczestników)

---

### `ClassRegistration.java`
**Tabela:** `ClassRegistrations`

Encja łącząca użytkowników z zajęciami (tabela asocjacyjna). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `registredUser` | `User` | Zarejestrowany użytkownik |
| `classEntity` | `ClassEntity` | Zajęcia, na które jest zapisany |
| `registrationDate` | `LocalDateTime` | Data rejestracji (auto) |
| `isActive` | `Boolean` | Czy rejestracja jest aktywna (soft delete) |

**Ograniczenie unikalności:** para `(user_id, class_id)` — użytkownik nie może mieć dwóch rejestracji na te same zajęcia.

---

### `Purchase.java`
**Tabela:** `Purchases`

Encja reprezentująca zakup (transakcję). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `buyer` | `User` | Kupujący (może być `null` dla gościa) |
| `offer` | `Offer` | Zakupiona oferta |
| `purchaseDate` | `LocalDateTime` | Data zakupu (auto) |
| `validUntil` | `LocalDateTime` | Data ważności (obliczana automatycznie na podstawie `durationDays` oferty) |

**Relacje:**
- `ManyToOne` → `User` (kupujący)
- `ManyToOne` → `Offer` (oferta)
- `OneToOne` → `GuestAction` (dane gościa, jeśli zakup nie przez zalogowanego użytkownika)

**Logika `@PrePersist`:** automatycznie ustawia `purchaseDate` na aktualną datę i oblicza `validUntil` jako `purchaseDate + durationDays`.

---

### `GuestAction.java`
**Tabela:** `GuestActions`

Encja przechowująca dane gościa (niezarejestrowanego użytkownika), który dokonał zakupu. Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `firstName` | `String` | Imię gościa |
| `lastName` | `String` | Nazwisko gościa |
| `email` | `String` | E-mail gościa |
| `phoneNumber` | `String` | Numer telefonu |
| `purchaseId` | `Purchase` | Powiązany zakup |
| `createdDate` | `LocalDateTime` | Data utworzenia (auto) |

---

### `Announcement.java`
**Tabela:** `Announcements`

Encja reprezentująca ogłoszenie. Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `employee` | `User` | Autor ogłoszenia (pracownik/admin) |
| `title` | `String` | Tytuł ogłoszenia |
| `content` | `String` | Treść ogłoszenia (TEXT) |
| `createdAt` | `LocalDateTime` | Data utworzenia (auto) |
| `isActive` | `Boolean` | Czy ogłoszenie aktywne (soft delete) |

---

### `GymInfo.java`
**Tabela:** `GymInfo`

Encja typu **Singleton** — przechowuje informacje o siłowni (zawsze jeden rekord z `id=1`). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny (zawsze = 1) |
| `openingHours` | `String` | Godziny otwarcia (TEXT) |
| `gymDesc` | `String` | Opis siłowni (TEXT) |
| `firstPhoneNumber` | `String` | Główny numer telefonu |
| `secondPhoneNumber` | `String` | Dodatkowy numer telefonu |
| `firstEmail` | `String` | Główny adres e-mail |
| `secondEmail` | `String` | Dodatkowy adres e-mail |
| `updatedBy` | `User` | Kto ostatnio zaktualizował |
| `updatedAt` | `LocalDateTime` | Kiedy ostatnio zaktualizowano |

---

### `GymAdmission.java`
**Tabela:** `GymAdmissions`

Encja reprezentująca wejście użytkownika na siłownię (rejestracja obecności). Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `user` | `User` | Użytkownik, który wszedł |
| `startTime` | `LocalDateTime` | Czas wejścia |
| `endTime` | `LocalDateTime` | Czas wyjścia |

---

### `Message.java`
**Tabela:** `Messages`

Encja reprezentująca wiadomość użytkownika w systemie. Pola:

| Pole | Typ | Opis |
|------|-----|------|
| `id` | `Long` | Klucz główny |
| `user` | `User` | Autor wiadomości |
| `sentTime` | `LocalDateTime` | Czas wysłania (auto) |
| `content` | `String` | Treść wiadomości (TEXT) |

---

## 6. Warstwa repozytoriów (`repository`)

Wszystkie repozytoria rozszerzają `JpaRepository` i zapewniają standardowe operacje CRUD oraz niestandardowe zapytania.

### `UserRepo.java`
Repozytorium encji `User`.
- `findByEmail(String email)` → `Optional<User>` — wyszukiwanie użytkownika po adresie e-mail (używane przy logowaniu i uwierzytelnianiu)

### `OfferRepo.java`
Repozytorium encji `Offer`.
- `findById(long id)` → `Offer` — wyszukiwanie oferty po ID

### `PurchaseRepo.java`
Repozytorium encji `Purchase`.
- `findByBuyerOrderByPurchaseDateDesc(User buyer)` → `List<Purchase>` — pobieranie zakupów danego użytkownika, posortowanych od najnowszego

### `ClassEntityRepo.java`
Repozytorium encji `ClassEntity`.
- `findById(long id)` → `ClassEntity` — wyszukiwanie zajęć po ID

### `ClassRegistrationRepo.java`
Repozytorium encji `ClassRegistration`.
- `findByRegistredUserAndClassEntity(User user, ClassEntity classEntity)` → `Optional<ClassRegistration>` — sprawdzenie, czy użytkownik jest już zapisany na dane zajęcia

### `AnnouncementRepo.java`
Repozytorium encji `Announcement`.
- `findByIsActiveTrueOrderByCreatedAtDesc()` → `List<Announcement>` — pobieranie aktywnych ogłoszeń (najnowsze najpierw)
- `findAllByOrderByCreatedAtDesc()` → `List<Announcement>` — pobieranie wszystkich ogłoszeń

### `GymInfoRepo.java`
Repozytorium encji `GymInfo`.
- Tylko standardowe metody CRUD (encja Singleton z `id=1`)

### `GymAdmissionRepo.java`
Repozytorium encji `GymAdmission`.
- `findByUserOrderByStartTimeDesc(User user)` → `List<GymAdmission>` — pobieranie wejść na siłownię danego użytkownika

### `GuestActionRepo.java`
Repozytorium encji `GuestAction`.
- Tylko standardowe metody CRUD

### `MessageRepo.java`
Repozytorium encji `Message`.
- Tylko standardowe metody CRUD

---

## 7. Warstwa DTO (`dto`)

Obiekty transferu danych (Data Transfer Objects) izolują warstwę API od encji bazodanowych. Zapewniają kontrolę nad tym, jakie dane są zwracane klientowi i jakie dane są przyjmowane w żądaniach.

### DTO odpowiedzi (dane zwracane do klienta)

#### `AuthResponse.java`
Odpowiedź po udanym logowaniu/rejestracji.
- `token` — token JWT
- `email`, `firstName`, `lastName` — dane użytkownika
- `role` — rola w systemie

#### `UserDTO.java`
Pełna reprezentacja użytkownika (bez hasła i avatara).
- `id`, `email`, `phoneNumber`, `firstName`, `lastName`
- `userRole`, `createdAt`, `lastLoggedInDate`
- `isGoogle`, `discount`, `adAgreement`, `isActive`

#### `OfferDTO.java`
Reprezentacja oferty z informacjami o twórcy i powiązanych zajęciach.
- Dane oferty: `id`, `offerName`, `offerDescription`, `priceText`, `price`, `durationDays`, `isPermanent`, `offerExpiredDate`, `createdAt`, `isActive`
- Dane twórcy: `createdById`, `createdByName`
- Powiązane zajęcia: `classInfo` (obiekt `ClassDTO`)

#### `PurchaseDTO.java`
Reprezentacja zakupu.
- `id`, `purchaseDate`, `validUntil`
- `userId`, `userName` — dane kupującego
- `offerId`, `offerName` — dane oferty

#### `ClassDTO.java`
Reprezentacja zajęć grupowych.
- `id`, `offerId`, `offerName`, `startTime`, `endTime`
- `instructorId`, `instructorName`
- `capacity`, `registeredCount` — pojemność i liczba zapisanych

#### `GymInfoDTO.java`
Informacje o siłowni.
- `id`, `openingHours`, `gymDesc`
- `firstPhoneNumber`, `secondPhoneNumber`, `firstEmail`, `secondEmail`
- `updatedAt`, `updatedByName`

#### `GymAdmissionDTO.java`
Reprezentacja wejścia na siłownię.
- `id`, `userId`, `userName`, `startTime`, `endTime`

#### `AnnouncementDTO.java`
Reprezentacja ogłoszenia.
- `id`, `title`, `content`, `createdAt`, `authorName`, `isActive`

---

### DTO żądań (dane przyjmowane od klienta)

#### `LoginRequest.java`
Żądanie logowania.
- `email` — `@Email @NotBlank`
- `password` — `@NotBlank`

#### `RegisterRequest.java`
Żądanie rejestracji nowego użytkownika.
- `email` — `@Email @NotBlank`
- `password` — `@NotBlank @Size(min=6, max=100)`
- `firstName` — `@Size(max=25)`
- `lastName` — `@Size(max=50)`
- `phoneNumber` — `@Size(max=15)`
- `discount` — typ zniżki (`NONE`, `STUDENT`, `MULTISPORT`)
- `adAgreement` — zgoda na reklamy

#### `UserUpdateRequest.java`
Żądanie aktualizacji danych użytkownika (wszystkie pola opcjonalne).
- `firstName`, `lastName`, `phoneNumber`, `discount`, `adAgreement`, `password`
- `userRole`, `isActive` — dostępne tylko dla admina

#### `OfferCreateRequest.java`
Żądanie utworzenia/aktualizacji oferty.
- `offerName` — `@NotBlank`
- `offerDescription`, `priceText` — opcjonalne
- `price` — `@NotNull` (BigDecimal)
- `durationDays` — `@NotNull`
- `isPermanent` — `@NotNull`
- `offerExpiredDate` — opcjonalna data wygaśnięcia

#### `PurchaseCreateRequest.java`
Żądanie utworzenia zakupu.
- `offerId` — `@NotNull` (ID oferty)
- `firstName`, `lastName`, `email`, `phoneNumber` — dane gościa (tylko przy zakupie bez logowania)

#### `ClassCreateRequest.java`
Żądanie utworzenia/aktualizacji zajęć.
- `offerId` — `@NotNull`
- `startTime`, `endTime` — `@NotNull`
- `instructorId` — opcjonalne
- `capacity` — `@NotNull`

#### `GymInfoUpdateRequest.java`
Żądanie aktualizacji informacji o siłowni (wszystkie pola opcjonalne).
- `openingHours`, `gymDesc`, `firstPhoneNumber`, `secondPhoneNumber`, `firstEmail`, `secondEmail`

#### `GymAdmissionCreateRequest.java`
Żądanie rejestracji wejścia na siłownię.
- `userId` — `@NotNull`
- `startTime`, `endTime` — `@NotNull`

#### `AnnouncementCreateRequest.java`
Żądanie utworzenia/aktualizacji ogłoszenia.
- `title` — `@NotBlank`
- `content` — `@NotBlank`

---

## 8. Warstwa serwisów (`service`)

### `AuthService.java`
Serwis odpowiedzialny za **uwierzytelnianie i rejestrację** użytkowników.

| Metoda | Opis |
|--------|------|
| `register(RegisterRequest)` | Rejestruje nowego użytkownika. Sprawdza unikalność e-maila, hashuje hasło (BCrypt), ustawia rolę `CLIENT`, zapisuje do bazy i zwraca token JWT. |
| `login(LoginRequest)` | Loguje użytkownika. Weryfikuje e-mail i hasło, sprawdza czy konto jest aktywne, aktualizuje datę ostatniego logowania i zwraca token JWT. |

---

### `UserService.java`
Serwis zarządzania **użytkownikami** — operacje dla zalogowanego użytkownika i administratora.

| Metoda | Opis |
|--------|------|
| `getCurrentUser(email)` | Pobiera dane aktualnie zalogowanego użytkownika na podstawie e-maila z tokenu JWT. |
| `updateCurrentUser(email, request)` | Aktualizuje dane zalogowanego użytkownika (imię, nazwisko, telefon, hasło, zniżka, zgoda reklamowa). |
| `deactivateAccount(email)` | Dezaktywuje konto zalogowanego użytkownika (soft delete — `isActive = false`). |
| `getAllUsers()` | *[Admin]* Pobiera listę wszystkich użytkowników. |
| `getUserById(id)` | *[Admin]* Pobiera użytkownika po ID. |
| `updateUser(id, request)` | *[Admin]* Aktualizuje dane dowolnego użytkownika (w tym rolę i status aktywności). |
| `deleteUser(id)` | *[Admin]* Dezaktywuje użytkownika (soft delete). |
| `createUser(request, role)` | *[Admin]* Tworzy nowego użytkownika z określoną rolą. |
| `uploadAvatar(email, data)` | Przesyła avatar użytkownika (dane binarne). |
| `getAvatar(email)` | Pobiera avatar użytkownika. |

---

### `OfferService.java`
Serwis zarządzania **ofertami** siłowni.

| Metoda | Opis |
|--------|------|
| `getActiveOffers()` | Pobiera listę aktywnych ofert (`isActive = true`). |
| `getAllOffers()` | Pobiera wszystkie oferty (aktywne i nieaktywne). |
| `getOfferById(id)` | Pobiera pojedynczą ofertę po ID. |
| `createOffer(request, email)` | Tworzy nową ofertę. Przypisuje pracownika jako twórcę. |
| `updateOffer(id, request)` | Aktualizuje istniejącą ofertę (częściowa aktualizacja — zmienia tylko przekazane pola). |
| `deleteOffer(id)` | Dezaktywuje ofertę (soft delete — `isActive = false`). |

---

### `PurchaseService.java`
Serwis obsługujący **zakupy i wejścia** na siłownię.

| Metoda | Opis |
|--------|------|
| `createPurchase(request, email)` | Tworzy zakup dla zalogowanego użytkownika. **Blokuje duplikaty** — nie pozwala kupić tej samej oferty czasowej, jeśli poprzednia jest jeszcze ważna. |
| `createGuestPurchase(request)` | Tworzy zakup dla gościa (niezarejestrowanego). Zapisuje dane gościa w tabeli `GuestActions`. |
| `getMyPurchases(email)` | Pobiera historię zakupów zalogowanego użytkownika. |
| `getMyAdmissions(email)` | Pobiera historię wejść na siłownię zalogowanego użytkownika. |
| `getAllAdmissions()` | *[Pracownik/Admin]* Pobiera listę wszystkich wejść na siłownię. |
| `createAdmission(userId, start, end)` | *[Pracownik/Admin]* Rejestruje wejście użytkownika na siłownię. |

---

### `ClassService.java`
Serwis zarządzania **zajęciami grupowymi**.

| Metoda | Opis |
|--------|------|
| `getAllClasses()` | Pobiera listę wszystkich zajęć. |
| `createClass(request)` | Tworzy nowe zajęcia grupowe powiązane z ofertą i opcjonalnym instruktorem. |
| `updateClass(id, request)` | Aktualizuje istniejące zajęcia (czas, pojemność, instruktor). |
| `deleteClass(id)` | Usuwa zajęcia (hard delete). |
| `getMyRegisteredClassIds(email)` | Pobiera ID zajęć, na które jest zapisany zalogowany użytkownik. |
| `registerForClass(classId, email)` | Zapisuje użytkownika na zajęcia. **Walidacja:** sprawdza wolne miejsca i czy użytkownik nie jest już zapisany. Obsługuje ponowną aktywację wypisanej rejestracji. |
| `unregisterFromClass(classId, email)` | Wypisuje użytkownika z zajęć (soft delete rejestracji — `isActive = false`). |

---

### `GymInfoService.java`
Serwis zarządzania **informacjami o siłowni**.

| Metoda | Opis |
|--------|------|
| `getGymInfo()` | Pobiera informacje o siłowni (singleton z `id=1`). Zwraca pusty DTO, jeśli dane jeszcze nie istnieją. |
| `updateGymInfo(request, email)` | Aktualizuje informacje o siłowni. Zapisuje kto i kiedy dokonał aktualizacji. |

---

### `AnnouncementService.java`
Serwis zarządzania **ogłoszeniami**.

| Metoda | Opis |
|--------|------|
| `getActiveAnnouncements()` | Pobiera aktywne ogłoszenia posortowane od najnowszego. |
| `getAllAnnouncements()` | Pobiera wszystkie ogłoszenia (aktywne i nieaktywne). |
| `createAnnouncement(request, email)` | Tworzy nowe ogłoszenie. Przypisuje pracownika jako autora. |
| `updateAnnouncement(id, request)` | Aktualizuje istniejące ogłoszenie (tytuł, treść). |
| `deleteAnnouncement(id)` | Dezaktywuje ogłoszenie (soft delete). |

---

## 9. Warstwa kontrolerów (`controller`)

### `AuthController.java`
**Bazowy URL:** `/api/auth`

Kontroler uwierzytelniania — dostępny publicznie.

| Metoda HTTP | Endpoint | Opis |
|------------|----------|------|
| `POST` | `/api/auth/login` | Logowanie — przyjmuje e-mail i hasło, zwraca token JWT |
| `POST` | `/api/auth/register` | Rejestracja nowego konta — przyjmuje dane użytkownika, zwraca token JWT |

---

### `UserController.java`
**Bazowy URL:** `/api/users`

Kontroler operacji na koncie zalogowanego użytkownika.

| Metoda HTTP | Endpoint | Opis |
|------------|----------|------|
| `GET` | `/api/users/me` | Pobiera dane aktualnie zalogowanego użytkownika |
| `PUT` | `/api/users/me` | Aktualizuje dane zalogowanego użytkownika |
| `DELETE` | `/api/users/me` | Dezaktywuje konto zalogowanego użytkownika |
| `POST` | `/api/users/me/avatar` | Przesyła avatar (max 2 MB, format multipart) |
| `GET` | `/api/users/me/avatar` | Pobiera avatar (zwraca PNG) |
| `DELETE` | `/api/users/me/avatar` | Usuwa avatar |

---

### `AdminController.java`
**Bazowy URL:** `/api/admin`

Kontroler panelu administracyjnego — **tylko rola ADMIN**.

| Metoda HTTP | Endpoint | Opis |
|------------|----------|------|
| `GET` | `/api/admin/users` | Lista wszystkich użytkowników |
| `GET` | `/api/admin/users/{id}` | Pobiera użytkownika po ID |
| `POST` | `/api/admin/users` | Tworzy nowego użytkownika (z parametrem `role`) |
| `PUT` | `/api/admin/users/{id}` | Aktualizuje dane użytkownika |
| `DELETE` | `/api/admin/users/{id}` | Dezaktywuje użytkownika |

---

### `OfferController.java`
**Bazowy URL:** `/api/offers`

Kontroler ofert siłowni.

| Metoda HTTP | Endpoint | Dostęp | Opis |
|------------|----------|--------|------|
| `GET` | `/api/offers` | Publiczny | Pobiera aktywne oferty |
| `GET` | `/api/offers/all` | Pracownik+ | Pobiera wszystkie oferty |
| `GET` | `/api/offers/{id}` | Publiczny | Pobiera ofertę po ID |
| `POST` | `/api/offers` | Pracownik+ | Tworzy nową ofertę |
| `PUT` | `/api/offers/{id}` | Pracownik+ | Aktualizuje ofertę |
| `DELETE` | `/api/offers/{id}` | Pracownik+ | Dezaktywuje ofertę |

---

### `PurchaseController.java`
**Bazowy URL:** `/api/purchases`

Kontroler zakupów.

| Metoda HTTP | Endpoint | Dostęp | Opis |
|------------|----------|--------|------|
| `POST` | `/api/purchases` | Zalogowany | Tworzy zakup dla zalogowanego użytkownika |
| `POST` | `/api/purchases/guest` | Publiczny | Tworzy zakup dla gościa |
| `GET` | `/api/purchases/my` | Zalogowany | Pobiera historię zakupów użytkownika |
| `GET` | `/api/purchases/admissions` | Zalogowany | Pobiera historię wejść na siłownię |

---

### `ClassController.java`
**Bazowy URL:** `/api/classes`

Kontroler zajęć grupowych.

| Metoda HTTP | Endpoint | Dostęp | Opis |
|------------|----------|--------|------|
| `GET` | `/api/classes` | Publiczny | Pobiera listę wszystkich zajęć |
| `POST` | `/api/classes` | Pracownik+ | Tworzy nowe zajęcia |
| `PUT` | `/api/classes/{id}` | Pracownik+ | Aktualizuje zajęcia |
| `DELETE` | `/api/classes/{id}` | Pracownik+ | Usuwa zajęcia |
| `GET` | `/api/classes/my-registrations` | Zalogowany | Pobiera ID zajęć, na które jest zapisany |
| `POST` | `/api/classes/{id}/register` | Zalogowany | Zapisuje na zajęcia |
| `DELETE` | `/api/classes/{id}/unregister` | Zalogowany | Wypisuje z zajęć |

---

### `GymInfoController.java`
**Bazowy URL:** `/api/gym-info`

Kontroler informacji o siłowni.

| Metoda HTTP | Endpoint | Dostęp | Opis |
|------------|----------|--------|------|
| `GET` | `/api/gym-info` | Publiczny | Pobiera informacje o siłowni |
| `PUT` | `/api/gym-info` | Pracownik+ | Aktualizuje informacje o siłowni |

---

### `GymAdmissionController.java`
**Bazowy URL:** `/api/gym-admissions`

Kontroler wejść na siłownię — **rola EMPLOYEE lub ADMIN**.

| Metoda HTTP | Endpoint | Opis |
|------------|----------|------|
| `GET` | `/api/gym-admissions` | Pobiera listę wszystkich wejść |
| `POST` | `/api/gym-admissions` | Rejestruje wejście użytkownika |
| `GET` | `/api/gym-admissions/clients` | Pobiera listę klientów (do wyboru przy rejestracji wejścia) |

---

### `AnnouncementController.java`
**Bazowy URL:** `/api/announcements`

Kontroler ogłoszeń.

| Metoda HTTP | Endpoint | Dostęp | Opis |
|------------|----------|--------|------|
| `GET` | `/api/announcements` | Publiczny | Pobiera aktywne ogłoszenia |
| `GET` | `/api/announcements/all` | Pracownik+ | Pobiera wszystkie ogłoszenia |
| `POST` | `/api/announcements` | Pracownik+ | Tworzy ogłoszenie |
| `PUT` | `/api/announcements/{id}` | Pracownik+ | Aktualizuje ogłoszenie |
| `DELETE` | `/api/announcements/{id}` | Pracownik+ | Dezaktywuje ogłoszenie |

---

## 10. Zasoby (`resources`)

### `application.properties`
Plik konfiguracyjny Spring Boot. Zawiera:

| Klucz | Wartość / Opis |
|-------|---------------|
| `spring.application.name` | `GymApp` |
| `spring.datasource.url` | Połączenie z PostgreSQL (konfigurowalne przez zmienne środowiskowe `POSTGRES_HOST`, `POSTGRES_DB`) |
| `spring.datasource.username` | Nazwa użytkownika bazy (zmienna `POSTGRES_USER`, domyślnie `postgres`) |
| `spring.datasource.password` | Hasło do bazy (zmienna `POSTGRES_PASSWORD`, domyślnie `postgres`) |
| `spring.jpa.hibernate.ddl-auto` | `update` — Hibernate automatycznie aktualizuje schemat bazy |
| `spring.jpa.show-sql` | `false` — logi SQL wyłączone |
| `spring.jpa.properties.hibernate.dialect` | `PostgreSQLDialect` |
| `jwt.secret` | Klucz do podpisywania JWT (konfigurowalne przez `JWT_SECRET`) |
| `jwt.expiration` | `86400000` (24 godziny w milisekundach) |
| `server.port` | `8080` |

---

## 11. Testy (`test`)

### `GymAppApplicationTests.java`
**Pakiet:** `org.gymapp.gymapp`

Podstawowy test integracyjny Spring Boot. Zawiera jeden test `contextLoads()`, który weryfikuje, czy kontekst aplikacji Spring uruchamia się poprawnie (wszystkie beany są poprawnie skonfigurowane i wstrzyknięte).

---

## Podsumowanie architektury

Projekt wykorzystuje **warstwową architekturę REST API**:

```
Klient (Frontend)
       ↓ HTTP Request
  [Controller]    ← Obsługa żądań HTTP, walidacja wejścia
       ↓
  [Service]       ← Logika biznesowa, mapowanie DTO ↔ Entity
       ↓
  [Repository]    ← Operacje na bazie danych (Spring Data JPA)
       ↓
  [Model/Entity]  ← Mapowanie obiektowo-relacyjne (JPA/Hibernate)
       ↓
  PostgreSQL      ← Baza danych
```

**Mechanizmy bezpieczeństwa:**
- Uwierzytelnianie bezstanowe (JWT)
- Autoryzacja oparta na rolach (ADMIN > EMPLOYEE > CLIENT)
- Hashowanie haseł (BCrypt)
- Walidacja danych wejściowych (Jakarta Validation)
- CORS skonfigurowany dla frontendów

**Wzorce projektowe:**
- Soft delete (dezaktywacja zamiast usuwania rekordów)
- DTO Pattern (izolacja warstwy API od bazy danych)
- Singleton (GymInfo — jeden rekord informacji o siłowni)
- Filtr łańcuchowy (JwtAuthFilter w pipeline Spring Security)
