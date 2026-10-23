# Synchronizacja ofert z Dyskiem Google

Dzięki temu te same oferty, karty katalogowe i dane firmy masz na telefonie, laptopie i PC.
Wszystko zapisuje się w folderze **„Oferty PV”** na Twoim Dysku Google.

Konfigurację robisz raz (ok. 5 minut), a potem na każdym urządzeniu tylko wklejasz adres i hasło.

## 1. Utwórz skrypt

1. Wejdź na **https://script.google.com** (zalogowany na konto Google, na którym mają być oferty).
2. Kliknij **Nowy projekt**.
3. U góry kliknij „Projekt bez nazwy” i nazwij go np. **Oferty PV – synchronizacja**.
4. Usuń wszystko z pliku `Kod.gs` i wklej całą zawartość pliku `Kod.gs` z tego repozytorium.
5. W linii `const HASLO = 'WPISZ-SWOJE-HASLO';` wpisz własne hasło, np. `const HASLO = 'MojeOferty2026!';`
   Hasło chroni dostęp do ofert – nie używaj hasła do konta Google.
6. Zapisz (ikona dyskietki lub Ctrl+S).

## 2. Wdróż jako aplikację internetową

1. Kliknij **Wdróż → Nowe wdrożenie**.
2. Przy „Wybierz typ” kliknij ikonę koła zębatego i wybierz **Aplikacja internetowa**.
3. Ustaw:
   - **Wykonaj jako:** Ja (Twój adres)
   - **Kto ma dostęp:** Każdy
4. Kliknij **Wdróż**.
5. Google poprosi o autoryzację: **Autoryzuj dostęp** → wybierz konto → jeśli pojawi się „Google nie zweryfikował tej aplikacji”, kliknij **Zaawansowane → Przejdź do projektu Oferty PV – synchronizacja** → **Zezwól**.
   (To Twój własny skrypt – prosi o dostęp do Twojego Dysku, żeby zapisywać tam oferty.)
6. Skopiuj **Adres URL aplikacji internetowej** – zaczyna się od `https://script.google.com/macros/s/` i kończy na `/exec`.

## 3. Połącz aplikację (na każdym urządzeniu)

1. Otwórz **https://greenit205-hash.github.io/oferty-pv/**
2. Rozwiń sekcję **Synchronizacja (Dysk Google)**.
3. Wklej adres skryptu i wpisz hasło z kroku 1.5.
4. Kliknij **Połącz i synchronizuj**. W pasku u góry pojawi się „Dysk: zsynchronizowano …”.

Zrób to na PC, laptopie i telefonie. Na telefonie warto dodać stronę do ekranu głównego (menu Chrome → „Dodaj do ekranu głównego”).

## Jak to działa

- Każda zmiana w ofercie zapisuje się sama po ok. 2 sekundach i trafia na Dysk.
- Po otwarciu aplikacji, powrocie do niej i otwarciu listy „Zapisane” aplikacja pobiera zmiany z innych urządzeń.
- Bez internetu wszystko działa dalej. Pasek pokaże „Dysk: offline”, a zmiany wyślą się po odzyskaniu połączenia.
- Jeśli tę samą ofertę zmienisz na dwóch urządzeniach, zostaje nowsza wersja.
- Usunięta oferta trafia do kosza na Dysku (folder „Oferty PV/dane”) i znika też z pozostałych urządzeń.
- Jeśli zaznaczysz „Zapisuj pobrane PDF-y”, każdy pobrany PDF ląduje też w folderze **Oferty PV/PDF**.
- Kliknięcie w pasek „Dysk: …” wymusza synchronizację.

## Zmiana skryptu w przyszłości

Gdy dostaniesz nową wersję `Kod.gs`: wklej ją, zachowaj swoje hasło, a potem
**Wdróż → Zarządzaj wdrożeniami → ołówek (Edytuj) → Wersja: Nowa wersja → Wdróż**.
Adres `/exec` zostaje ten sam, więc w aplikacji nic nie zmieniasz.

## Problemy

| Komunikat | Co zrobić |
|---|---|
| Nieprawidłowe hasło | Hasło w aplikacji musi być identyczne jak w `Kod.gs`. |
| Ustaw hasło w skrypcie | Wpisz hasło w `Kod.gs` i wdróż nową wersję (patrz wyżej). |
| Skrypt nie odpowiada poprawnie | Sprawdź, czy adres kończy się na `/exec` i czy „Kto ma dostęp” to **Każdy**. |
