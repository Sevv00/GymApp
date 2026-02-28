# Dokumentacja projektu GymApp — katalog `gym-frontend/`

## Spis treści

1. [Przegląd frontendu](#1-przegląd-frontendu)
2. [Struktura katalogów](#2-struktura-katalogów)
3. [Pliki konfiguracyjne (root)](#3-pliki-konfiguracyjne-root)
4. [Punkt wejścia aplikacji](#4-punkt-wejścia-aplikacji)
5. [Routing (`App.tsx`)](#5-routing-apptsx)
6. [Layout (`Layout.tsx`)](#6-layout-layouttsx)
7. [Kontekst i stan globalny (`context`)](#7-kontekst-i-stan-globalny-context)
8. [Typy TypeScript (`types`)](#8-typy-typescript-types)
9. [Warstwa API (`services`, `lib`)](#9-warstwa-api-services-lib)
10. [Strony (`pages`)](#10-strony-pages)
11. [Komponenty UI (`components`)](#11-komponenty-ui-components)
12. [Style (`index.css`)](#12-style-indexcss)
13. [Docker i wdrożenie](#13-docker-i-wdrożenie)
14. [Podsumowanie architektury](#14-podsumowanie-architektury)

---

## 1. Przegląd frontendu

**gym-frontend** to aplikacja kliencka (SPA) napisana w **React 19 + TypeScript**, służąca jako interfejs użytkownika do aplikacji GymApp. Obsługuje trzy role użytkowników: klient, pracownik i administrator.

**Stos technologiczny:**
- **React 19** — biblioteka UI
- **TypeScript** — typowanie statyczne
- **Vite 7** — bundler i serwer deweloperski
- **Tailwind CSS 4** — framework CSS utility-first
- **React Router 7** — routing klienta (SPA)
- **Axios** — klient HTTP do komunikacji z API
- **Radix UI** — prymitywy komponentów (Dialog, Slot)
- **Lucide React** — ikony
- **class-variance-authority** — warianty komponentów
- **tw-animate-css** — animacje CSS

---

## 2. Struktura katalogów

```
gym-frontend/
├── Dockerfile               ← Konteneryzacja (build + nginx)
├── index.html               ← Główny plik HTML (SPA)
├── nginx.conf               ← Konfiguracja nginx (produkcja)
├── package.json             ← Zależności i skrypty npm
├── tsconfig.json            ← Konfiguracja TypeScript
├── vite.config.ts           ← Konfiguracja Vite + proxy API
├── public/                  ← Pliki statyczne (favicon)
└── src/
    ├── main.tsx             ← Punkt wejścia React
    ├── App.tsx              ← Definicja tras (routing)
    ├── Layout.tsx           ← Wspólny layout (nawigacja + stopka)
    ├── index.css            ← Style globalne + motyw Tailwind
    ├── components/
    │   ├── theme-provider.tsx  ← Provider motywu (dark/light)
    │   ├── layout/             ← [Nieużywane — layout w Layout.tsx]
    │   └── ui/
    │       ├── button.tsx      ← Komponent Button
    │       ├── card.tsx        ← Komponent Card
    │       ├── dialog.tsx      ← Komponent Dialog (modal)
    │       └── input.tsx       ← Komponent Input
    ├── context/
    │   └── AuthContext.tsx     ← Kontekst uwierzytelniania
    ├── lib/
    │   ├── api.ts             ← Stała BASE_URL API
    │   └── utils.ts           ← Funkcja pomocnicza cn()
    ├── pages/
    │   ├── MainPage.tsx       ← Strona główna
    │   ├── LoginPage.tsx      ← Logowanie
    │   ├── RegisterPage.tsx   ← Rejestracja
    │   ├── OffersPage.tsx     ← Lista ofert i zajęć
    │   ├── OffersTransaction.tsx ← Finalizacja zakupu
    │   ├── LoggedUserPage.tsx ← Panel zalogowanego użytkownika
    │   ├── EmployeePanel.tsx  ← Panel pracownika
    │   └── AdminPanel.tsx     ← Panel administratora
    ├── services/
    │   └── api.ts             ← Instancja Axios (interceptory)
    └── types/
        └── index.ts           ← Interfejsy TypeScript
```

---

## 3. Pliki konfiguracyjne (root)

### `package.json`
Definicja projektu npm. Zawiera:
- **Skrypty:** `dev` (serwer deweloperski Vite), `build` (budowanie produkcyjne TSC + Vite), `preview` (podgląd builda)
- **Zależności produkcyjne:** React, React Router, Axios, Tailwind CSS, Radix UI, Lucide React, CVA
- **Zależności deweloperskie:** TypeScript, Vite plugin React, typy dla React i Node

### `vite.config.ts`
Konfiguracja bundlera Vite:
- **Pluginy:** `react()` (JSX Fast Refresh), `tailwindcss()` (przetwarzanie Tailwind)
- **Alias:** `@` → `./src` (import ze ścieżką `@/components/...`)
- **Serwer deweloperski:** port `3000`, proxy `/api` → `http://localhost:8080` (backend Spring Boot)

### `tsconfig.json`
Konfiguracja kompilatora TypeScript:
- Target: `ES2022`, JSX: `react-jsx`
- Strict mode włączony
- Path alias: `@/*` → `./src/*`
- Module resolution: `bundler` (kompatybilność z Vite)

### `index.html`
Główny plik HTML aplikacji SPA:
- Język: `pl` (polski)
- Tytuł: „GymApp - Zarządzanie Siłownią"
- Kontener React: `<div id="root">`
- Entry point: `/src/main.tsx`

### `nginx.conf`
Konfiguracja serwera nginx dla wdrożenia produkcyjnego:
- **SPA routing:** `try_files $uri $uri/ /index.html` — wszystkie trasy kierowane na `index.html`
- **Proxy API:** `/api/` → `http://backend:8080` (nazwa kontenera Docker)
- **Cache:** pliki statyczne (JS, CSS, obrazy, fonty) cache'owane na 1 rok z nagłówkiem `immutable`

### `Dockerfile`
Wieloetapowy Dockerfile:
1. **Build stage:** Node 20 Alpine — instalacja zależności (`npm ci`) i budowanie (`npm run build`)
2. **Serve stage:** Nginx Alpine — serwowanie plików z `/app/dist`, konfiguracja z `nginx.conf`
- Nasłuch na porcie `80`

---

## 4. Punkt wejścia aplikacji

### `main.tsx`
Plik startowy React. Renderuje drzewo komponentów w kontenerze `#root`:

```
<React.StrictMode>
  <BrowserRouter>          ← Router HTML5 History
    <ThemeProvider>         ← Zarządzanie motywem dark/light
      <AuthProvider>        ← Stan uwierzytelniania
        <App />             ← Routing stron
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</React.StrictMode>
```

- **StrictMode** — podwójne renderowanie w development (wykrywanie problemów)
- **BrowserRouter** — React Router z History API
- **ThemeProvider** — domyślny motyw `dark`, klucz localStorage: `gymapp-theme`
- **AuthProvider** — globalny kontekst użytkownika i tokenu JWT

---

## 5. Routing (`App.tsx`)

Definiuje wszystkie trasy aplikacji (React Router). Wszystkie trasy są opakowane w `<Layout>`.

| Ścieżka | Komponent | Opis |
|---------|-----------|------|
| `/` | `MainPage` | Strona główna (hero, informacje o siłowni, ogłoszenia) |
| `/login` | `LoginPage` | Formularz logowania |
| `/register` | `RegisterPage` | Formularz rejestracji |
| `/offers` | `OffersPage` | Lista ofert (karnety) i zajęć grupowych |
| `/offers/:offerId/buy` | `OffersTransaction` | Formularz zakupu oferty |
| `/dashboard` | `LoggedUserPage` | Panel zalogowanego użytkownika |
| `/employee` | `EmployeePanel` | Panel pracownika (zarządzanie treścią) |
| `/admin` | `AdminPanel` | Panel administratora (zarządzanie użytkownikami) |

---

## 6. Layout (`Layout.tsx`)

Wspólny layout aplikacji opakowujący wszystkie strony. Zawiera:

### Nawigacja górna (Header)
- **Logo** — link do strony głównej z ikoną Dumbbell
- **Menu desktopowe** — linki nawigacyjne:
  - „Strona główna" i „Oferty" — widoczne zawsze
  - „Mój panel" — widoczny po zalogowaniu
  - „Pracownik" — widoczny dla roli EMPLOYEE/ADMIN
  - „Admin" — widoczny dla roli ADMIN
- **Menu mobilne (hamburger)** — responsywna nawigacja z przyciskiem hamburger, rozwijane menu z tymi samymi linkami
- **Kontrolki użytkownika:**
  - Niezalogowany: przyciski „Zaloguj" i „Zarejestruj"
  - Zalogowany: wyświetlanie imienia, przycisk „Wyloguj"

### Treść główna
- `<Outlet />` — tu renderowany jest komponent aktualnej trasy

### Stopka (Footer)
- Informacja o prawach autorskich z dynamicznym rokiem

---

## 7. Kontekst i stan globalny (`context`)

### `AuthContext.tsx`
Kontekst React przechowujący globalny stan uwierzytelniania. Udostępnia:

| Wartość | Typ | Opis |
|---------|-----|------|
| `user` | `User \| null` | Dane zalogowanego użytkownika |
| `token` | `string \| null` | Token JWT (przechowywany w localStorage) |
| `login(email, password)` | `Promise<void>` | Logowanie — wysyła POST do `/api/auth/login`, zapisuje token, pobiera profil |
| `register(data)` | `Promise<void>` | Rejestracja — wysyła POST do `/api/auth/register`, zapisuje token, pobiera profil |
| `logout()` | `void` | Wylogowanie — usuwa token z localStorage, czyści stan |
| `isAuthenticated` | `boolean` | Czy użytkownik jest zalogowany |
| `isEmployee` | `boolean` | Czy rola to EMPLOYEE lub ADMIN |
| `isAdmin` | `boolean` | Czy rola to ADMIN |
| `refreshUser()` | `Promise<void>` | Odświeża dane użytkownika z API (`GET /api/users/me`) |

**Zachowanie przy starcie:** jeśli token istnieje w localStorage, automatycznie pobiera profil użytkownika. Jeśli token jest nieważny — wylogowuje.

**Hook:** `useAuth()` — dostęp do kontekstu z dowolnego komponentu.

---

## 8. Typy TypeScript (`types`)

### `types/index.ts`
Definicje interfejsów TypeScript odpowiadających DTO backendu:

| Interfejs | Opis | Kluczowe pola |
|-----------|------|---------------|
| `User` | Dane użytkownika | `id`, `email`, `firstName`, `lastName`, `userRole`, `discount`, `isActive` |
| `AuthResponse` | Odpowiedź logowania/rejestracji | `token`, `email`, `firstName`, `lastName`, `role` |
| `Offer` | Oferta siłowni | `id`, `offerName`, `price`, `durationDays`, `isPermanent`, `isActive`, `classInfo?` |
| `ClassInfo` | Zajęcia grupowe | `id`, `startTime`, `endTime`, `instructorName`, `capacity`, `registeredCount` |
| `Announcement` | Ogłoszenie | `id`, `title`, `content`, `createdAt`, `authorName`, `isActive` |
| `GymInfo` | Informacje o siłowni | `openingHours`, `gymDesc`, telefony, emaile |
| `Purchase` | Zakup | `id`, `offerName`, `purchaseDate`, `validUntil` |
| `GymAdmission` | Wejście na siłownię | `id`, `userId`, `userName`, `startTime`, `endTime` |

---

## 9. Warstwa API (`services`, `lib`)

### `services/api.ts`
Główna instancja **Axios** do komunikacji z backendem. Konfiguracja:

- **Base URL:** z zmiennej środowiskowej `VITE_API_URL` (domyślnie pusty — proxy Vite)
- **Nagłówek:** `Content-Type: application/json`
- **Interceptor żądania:** automatycznie dodaje nagłówek `Authorization: Bearer <token>` z localStorage
- **Interceptor odpowiedzi:** przy kodzie `401` (Unauthorized) — automatyczne wylogowanie (czyszczenie localStorage, przekierowanie na `/login`)

### `lib/api.ts`
Eksportuje stałą `API_BASE_URL` z zmiennej środowiskowej `VITE_API_BASE_URL`. Pomocniczy plik (alternatywny dostęp do konfiguracji URL).

### `lib/utils.ts`
Funkcja pomocnicza `cn(...inputs)`:
- Łączy klasy CSS za pomocą `clsx` i `tailwind-merge`
- Zapobiega konfliktom klas Tailwind (np. `px-4` i `px-6` — wygrywa ostatnia)
- Używana we wszystkich komponentach UI

---

## 10. Strony (`pages`)

### `MainPage.tsx`
**Trasa:** `/`

Strona główna aplikacji. Sekcje:

1. **Hero** — duży baner z motywem gradient, tytuł „Twoja Siłownia, Twoje Cele", opis siłowni (z `GymInfo.gymDesc`), przyciski CTA:
   - „Zobacz oferty" → `/offers`
   - „Dołącz do nas" → `/register` (widoczny tylko dla niezalogowanych)

2. **Cechy** — trzy karty: „Profesjonalny Sprzęt", „Zajęcia Grupowe", „Osiągaj Cele"

3. **Informacje o siłowni** — godziny otwarcia, numery telefonów, adresy e-mail (dane z endpointu `GET /api/gym-info`)

4. **Aktualności** — siatka kart z ogłoszeniami (max 6, z endpointu `GET /api/announcements`). Kliknięcie otwiera modal z pełną treścią ogłoszenia (`Dialog`).

5. **CTA** — sekcja z przyciskiem „Przejdź do ofert"

**Zapytania API:** `GET /api/gym-info`, `GET /api/announcements` (równoległe ładowanie przy montowaniu)

---

### `LoginPage.tsx`
**Trasa:** `/login`

Formularz logowania z polami:
- **Email** — pole email, wymagane
- **Hasło** — pole z przyciskiem pokaż/ukryj hasło (ikona oko)

**Logika:**
- Wywołuje `login(email, password)` z `AuthContext`
- Po udanym logowaniu → przekierowanie na `/dashboard`
- Przy błędzie → wyświetlenie komunikatu błędu z API
- Link „Zarejestruj się" → `/register`

---

### `RegisterPage.tsx`
**Trasa:** `/register`

Rozbudowany formularz rejestracji z polami:
- **Imię**, **Nazwisko** — opcjonalne
- **Email** — wymagany, walidacja formatu
- **Numer telefonu** — opcjonalny, walidacja: dokładnie 9 cyfr
- **Hasło** — wymagane, min. 6 znaków, przycisk pokaż/ukryj
- **Powtórz hasło** — walidacja zgodności
- **Zniżka** — select: Brak, Studencka, Multisport
- **Zgoda marketingowa** — checkbox

**Walidacja frontendowa:**
- Zgodność haseł
- Minimalna długość hasła (6 znaków)
- Format numeru telefonu (9 cyfr)

**Logika:** wywołanie `register(data)` → przekierowanie na `/dashboard`

---

### `OffersPage.tsx`
**Trasa:** `/offers`

Strona z dwoma zakładkami:

#### Zakładka „Karnety i Oferty"
- Wyświetla oferty bez powiązanych zajęć (karnety, wejściówki)
- Każda oferta jako karta z: nazwą, ceną, opisem, czasem ważności
- **Zniżki:** jeśli zalogowany użytkownik ma zniżkę (STUDENT: -20%, MULTISPORT: -40%), ceny są automatycznie przeliczane, oryginalna cena przekreślona
- **Blokada duplikatów:** jeśli użytkownik posiada aktywny karnet danego typu, wyświetla się badge „Posiadasz aktywny karnet" zamiast przycisku zakupu
- Przycisk „Kup teraz" → `/offers/:id/buy`

#### Zakładka „Zajęcia"
- Wyświetla zajęcia grupowe z: nazwą, instruktorem, datą/godziną, liczbą miejsc
- **Przyciski rejestracji:**
  - „Zapisz się" — jeśli są wolne miejsca i użytkownik jest zalogowany
  - „Wypisz się" — jeśli użytkownik jest już zapisany
  - „Brak miejsc" — jeśli zajęcia pełne
  - Dla niezalogowanych: informacja o konieczności logowania

**Zapytania API:** `GET /api/offers`, `GET /api/classes`, `GET /api/classes/my-registrations`, `GET /api/purchases/my`

---

### `OffersTransaction.tsx`
**Trasa:** `/offers/:offerId/buy`

Strona finalizacji zakupu oferty. Dwa tryby:

#### Zalogowany użytkownik
- Podsumowanie oferty z ceną (uwzględnia zniżkę użytkownika)
- Dane użytkownika wyświetlone automatycznie
- Blokada zakupu, jeśli posiada aktywny karnet tego typu
- Przycisk „Potwierdź zakup" → `POST /api/purchases`

#### Gość (niezalogowany)
- Formularz z polami: imię, nazwisko, email (wymagany), telefon
- Przycisk „Kup jako gość" → `POST /api/purchases/guest`
- Link do logowania

**Po udanym zakupie:** ekran potwierdzenia z ikoną checkmark, informacją o ważności karnetu i przyciskiem powrotu do ofert.

**Zapytania API:** `GET /api/offers/:id`, `GET /api/purchases/my` (sprawdzenie aktywnych), `POST /api/purchases` lub `POST /api/purchases/guest`

---

### `LoggedUserPage.tsx`
**Trasa:** `/dashboard`

Panel zalogowanego użytkownika z czterema zakładkami:

#### Zakładka „Przegląd"
- Statystyki: aktywne karnety, łączne zakupy, wejścia na siłownię
- Lista aktywnych karnetów z datą zakupu i datą wygaśnięcia

#### Zakładka „Zakupy"
- Historia wszystkich zakupów w formie listy
- Status: „Aktywny" (zielony) lub „Wygasł" (szary)

#### Zakładka „Wejścia"
- Historia wejść na siłownię z datą i godzinami

#### Zakładka „Edytuj dane"
- Formularz edycji profilu: imię, nazwisko, telefon (walidacja 9 cyfr), zniżka, nowe hasło, zgoda marketingowa
- Przycisk „Zapisz zmiany" → `PUT /api/users/me`
- Przycisk „Dezaktywuj konto" → `DELETE /api/users/me` (z potwierdzeniem)

**Avatar:**
- Wyświetlanie aktualnego avatara w nagłówku
- Upload nowego avatara (hover na obrazku, max 2 MB) → `POST /api/users/me/avatar`

**Zabezpieczenie:** automatyczne przekierowanie na `/login` jeśli niezalogowany.

**Zapytania API:** `GET /api/purchases/my`, `GET /api/purchases/admissions`, `GET /api/users/me/avatar`, `PUT /api/users/me`, `DELETE /api/users/me`, `POST /api/users/me/avatar`

---

### `EmployeePanel.tsx`
**Trasa:** `/employee`

Rozbudowany panel zarządzania dla pracowników i administratorów. Pięć zakładek:

#### 1. Ogłoszenia
- **Formularz tworzenia:** tytuł + treść → `POST /api/announcements`
- **Lista ogłoszeń:** wyświetla wszystkie (aktywne i nieaktywne)
- **Edycja inline:** przycisk edycji otwiera pola edycji w wierszu → `PUT /api/announcements/:id`
- **Dezaktywacja:** przycisk usuwania (z potwierdzeniem) → `DELETE /api/announcements/:id`

#### 2. Oferty
- **Formularz tworzenia:** nazwa, cena opisowa, cena numeryczna, czas trwania, opis, checkbox „Oferta stała" → `POST /api/offers`
- **Lista ofert:** z nazwą, ceną i czasem trwania
- **Edycja inline:** pełny formularz edycji → `PUT /api/offers/:id`
- **Dezaktywacja:** → `DELETE /api/offers/:id`

#### 3. Zajęcia
- **Formularz tworzenia:** select oferty (z aktywnych), daty start/koniec (datetime-local), pojemność → `POST /api/classes`
- **Lista zajęć:** data, godziny, prowadzący, liczba uczestników/pojemność
- **Edycja inline:** modyfikacja czasu i pojemności → `PUT /api/classes/:id`
- **Usuwanie:** → `DELETE /api/classes/:id`

#### 4. Wejścia (Admissions)
- **Formularz dodawania:** select klienta (z listy aktywnych użytkowników), godzina wejścia i wyjścia → `POST /api/gym-admissions`
- **Lista wejść:** nazwa klienta, data i godziny

#### 5. Info o siłowni
- Formularz edycji: opis, godziny otwarcia, 2× telefon, 2× email → `PUT /api/gym-info`

**Zabezpieczenie:** automatyczne przekierowanie na `/login` jeśli nie jest pracownikiem/adminem.

**Zapytania API:** `/api/announcements/all`, `/api/offers/all`, `/api/classes`, `/api/gym-info`, `/api/gym-admissions`, `/api/gym-admissions/clients`

---

### `AdminPanel.tsx`
**Trasa:** `/admin`

Panel administracyjny do zarządzania użytkownikami.

**Funkcjonalności:**
- **Pasek wyszukiwania** — filtrowanie użytkowników po imieniu, nazwisku, emailu (filtrowanie po stronie klienta)
- **Statystyki** — karty z liczbą: łącznie, klienci, pracownicy, administratorzy
- **Tworzenie użytkownika** — rozwijany formularz: email, hasło, rola (select), imię, nazwisko, telefon → `POST /api/admin/users?role=...`
- **Tabela użytkowników** — kolumny: ID, imię/nazwisko, email, rola (badge z kolorami), status (aktywny/nieaktywny), zniżka
- **Edycja inline** — edycja imienia, nazwiska, roli, statusu aktywności, zniżki bezpośrednio w wierszu tabeli → `PUT /api/admin/users/:id`
- **Dezaktywacja** — przycisk usuwania (z potwierdzeniem) → `DELETE /api/admin/users/:id`

**Role badges:**
- Administrator — czerwone tło
- Pracownik — fioletowe tło (primary)
- Klient — szare tło

**Zabezpieczenie:** automatyczne przekierowanie na `/login` jeśli nie jest adminem.

**Zapytania API:** `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`

---

## 11. Komponenty UI (`components`)

### `theme-provider.tsx`
Provider motywu (dark/light/system). Zarządza klasą CSS na `<html>`:
- Zapisuje preferencję w `localStorage` (klucz: `gymapp-theme`)
- Domyślny motyw: `dark`
- Obsługuje tryb `system` (preferencje systemu operacyjnego)
- Hook `useTheme()` do odczytu i zmiany motywu

### `ui/button.tsx`
Komponent `<Button>` z wariantami (CVA):

| Wariant | Opis |
|---------|------|
| `default` | Fioletowe tło (primary), biały tekst |
| `destructive` | Czerwone tło, biały tekst |
| `outline` | Obramowanie, przezroczyste tło |
| `secondary` | Jasne tło secondary |
| `ghost` | Bez tła, podświetlenie on hover |
| `link` | Tekst z podkreśleniem |

| Rozmiar | Opis |
|---------|------|
| `default` | h-9, px-4 |
| `sm` | h-8, px-3 |
| `lg` | h-10, px-6 |
| `icon` | 36×36 px |
| `icon-sm` | 32×32 px |
| `icon-lg` | 40×40 px |

Obsługuje prop `asChild` (Radix Slot) do renderowania jako inny element (np. `<Link>`).

### `ui/card.tsx`
Zestaw komponentów karty:
- `Card` — kontener z obramowaniem, cieniem, zaokrąglonymi rogami
- `CardHeader` — nagłówek z gridem (auto-layout dla akcji)
- `CardTitle` — tytuł (tekst lg/xl, pogrubiony)
- `CardDescription` — podtytuł (szary, mały)
- `CardAction` — akcja w nagłówku (np. przycisk)
- `CardContent` — treść karty
- `CardFooter` — stopka karty

### `ui/dialog.tsx`
Komponent modalny oparty na **Radix UI Dialog**:
- `Dialog` — root z obsługą scrollbar width (zapobiega przeskakiwaniu strony)
- `DialogOverlay` — półprzezroczyste tło (czarne 50%)
- `DialogContent` — wyśrodkowany panel z animacjami fade-in/zoom-in
- `DialogHeader`, `DialogFooter` — layout nagłówka/stopki
- `DialogTitle`, `DialogDescription` — tekst nagłówka
- `DialogClose` — przycisk zamknięcia (X)
- `DialogTrigger` — element wyzwalający otwarcie

### `ui/input.tsx`
Komponent `<Input>` — stylizowany element `<input>`:
- Obsługa typów: text, email, password, number, tel, datetime-local, file
- Stylizacja Tailwind: obramowanie, shadow, focus ring, placeholder
- Wsparcie dla stanów: invalid (ring destructive), disabled (opacity 50%)

---

## 12. Style (`index.css`)

Globalny plik stylów z konfiguracją Tailwind CSS 4:

### Import
- `tailwindcss` — bazowe style Tailwind
- `tw-animate-css` — animacje CSS

### Motyw (Theme)
Definiuje zmienne CSS dla dwóch motywów:

| Zmienna | Light | Dark |
|---------|-------|------|
| `--background` | `#f0f4fa` (jasne niebiesko-szare) | `#030027` (ciemny granat) |
| `--foreground` | `#030027` | `#e2e8f4` |
| `--primary` | `#9B7EDE` (fioletowy) | `#9B7EDE` |
| `--accent` | `#B0F2B4` (miętowy zielony) | `#B0F2B4` |
| `--card` | `#ffffff` | `#151E3F` (ciemny granat) |
| `--destructive` | `#e53e3e` (czerwony) | `#e53e3e` |
| `--muted` | `#dce5f0` | `#1e2a4a` |
| `--border` | `#c8d4e3` | `#2a3660` |

### Paleta kolorów
- **Primary (fioletowy `#9B7EDE`)** — przyciski, linki, akcje główne
- **Accent (miętowy `#B0F2B4`)** — wyróżnienia, badge'e, ceny
- **Destructive (czerwony `#e53e3e`)** — błędy, usuwanie
- **Muted** — tła drugorzędne, tekst pomocniczy

### Dodatkowe
- Niestandardowy scrollbar (8px, primary thumb)
- Font: `Segoe UI`, system-ui, sans-serif

---

## 13. Docker i wdrożenie

### Dockerfile
Dwuetapowy build:
1. **Build:** `node:20-alpine` — instalacja zależności i budowanie (`npm ci` + `npm run build`)
2. **Produkcja:** `nginx:alpine` — kopiowanie plików dist + konfiguracja nginx

### nginx.conf
- SPA fallback na `index.html`
- Proxy `/api/` do `backend:8080` (nazwa usługi Docker Compose)
- Cache statycznych zasobów: 1 rok

### Komunikacja z backendem
- **Development:** Vite proxy (`/api` → `localhost:8080`)
- **Produkcja:** nginx reverse proxy (`/api/` → `backend:8080`)

---

## 14. Podsumowanie architektury

```
Użytkownik (Przeglądarka)
        ↓
  [Layout.tsx]          ← Nawigacja, routing, autoryzacja widoków
        ↓
  [Pages/*]             ← Strony aplikacji (logika biznesowa UI)
        ↓
  [AuthContext]          ← Stan globalny (user, token, role)
        ↓
  [services/api.ts]     ← Axios (interceptory JWT, obsługa 401)
        ↓ HTTP (REST)
  Backend Spring Boot   ← API na porcie 8080
```

### Zarządzanie stanem
- **Globalny:** `AuthContext` (użytkownik, token JWT, role)
- **Lokalny:** `useState` w każdym komponencie strony (dane, formularze, loading)

### Wzorce
- **Context Pattern** — globalny stan uwierzytelniania
- **Interceptor Pattern** — automatyczne dodawanie tokenu JWT i obsługa 401
- **Soft Delete** — dezaktywacja zamiast usuwania (zgodne z backendem)
- **Optimistic UI** — formularz edycji inline bez przeładowania strony
- **Component Composition** — shadcn/ui wzorzec komponentów (CVA + Radix + Tailwind)

### Zabezpieczenia (frontend)
- Token JWT w localStorage, automatycznie dodawany do żądań
- Automatyczne wylogowanie przy 401
- Warunkowe renderowanie nawigacji i stron na podstawie roli
- Walidacja formularzy (email, hasło, telefon) przed wysłaniem
- Ochrona tras — przekierowanie na `/login` dla stron wymagających uprawnień

### Responsywność
- Pełna responsywność (mobile-first, Tailwind breakpoints)
- Menu hamburger na urządzeniach mobilnych
- Siatki adaptujące się: 1 → 2 → 3 kolumny
