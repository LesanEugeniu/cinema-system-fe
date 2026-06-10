# 🎬 CineTicket — Cinema Management System

Sistem complet de gestionare a unui cinema cu **backend Spring Boot** și **frontend Angular 18**.

---

## 📁 Structura Proiectului

```
cinema-system/           ← Backend (Spring Boot + PostgreSQL)
cinema-frontend/         ← Frontend (Angular 18)
docker-compose.yaml      ← Lansare completă cu Docker
```

---

## 🚀 Lansare Rapidă (Docker — recomandat)

### Cerințe
- Docker și Docker Compose instalate
- Porturile 4200, 8080, 5433 libere

### Pași

1. **Construiește JAR-ul backend-ului:**
```bash
cd cinema-system
./mvnw clean package -DskipTests
cd ..
```

2. **Lansează totul cu Docker Compose:**
```bash
docker-compose -f cinema-frontend/docker-compose.yaml up --build
```

3. **Deschide în browser:**
- 🌐 **Frontend:** http://localhost:4200
- 🔌 **Backend API:** http://localhost:8080/api/v1

---

## 🖥️ Lansare Manuală (Dezvoltare)

### Backend

```bash
cd cinema-system

# Pornește PostgreSQL (local sau Docker):
docker run -d --name cinema-postgres \
  -e POSTGRES_DB=cinema \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:latest

# Lansează backend-ul:
./mvnw spring-boot:run
```

Backend-ul rulează pe **http://localhost:8080**

### Frontend

```bash
cd cinema-frontend

# Instalează dependențele:
npm install

# Lansează serverul de dezvoltare:
ng serve
# sau
npm start
```

Frontend-ul rulează pe **http://localhost:4200**

---

## 👤 Conturi Predefinite

| Rol   | Email            | Parolă  |
|-------|------------------|---------|
| Admin | admin@mail.com   | admin   |
| User  | user@mail.com    | user    |

---

## 📋 Funcționalități

### Pagini Publice (fără autentificare)
- **Filme** — Grid cu toate filmele, banner de căutare cu filtre:
  - Actori, Director, Sunet (SoundFormat), Format (2D/3D), Limba (RO/EN/RU), Gen
- **Program** — Filmele programate pe zile (selector 7 zile), cu ore de proiecție
- **Detaliu Film** — Informații complete + trailer YouTube integrat

### Funcționalități cu Autentificare (USER)
- **Rezervare** — Selector interactiv de scaune per sală, cu confirmare
- **Înregistrare / Autentificare** — JWT tokens

### Panou Admin (ADMIN)
- CRUD complet pentru: **Filme, Actori, Regizori, Săli, Proiecții, Rezervări**
- Upload imagine pentru filme
- Tabeluri cu editare și ștergere

---

## 🔌 API Endpoints

| Resursă       | GET (public) | POST/PUT/DELETE (admin) | Căutare                     |
|---------------|:------------:|:-----------------------:|-----------------------------|
| `/movies`     | ✅           | ✅ (multipart)          | `POST /movies/search`       |
| `/actors`     | ✅           | ✅                      |                             |
| `/directors`  | ✅           | ✅                      |                             |
| `/halls`      | ✅           | ✅                      |                             |
| `/seats`      | ✅           | ✅                      |                             |
| `/screenings` | ✅           | ✅                      |                             |
| `/bookings`   | ✅           | ✅                      |                             |
| `/auth`       |              | register, authenticate  |                             |

Toate endpoint-urile sunt sub prefixul `/api/v1/`.

---

## 🏗️ Tehnologii

### Backend
- Java 21, Spring Boot 3
- Spring Security + JWT
- Spring Data JPA + PostgreSQL
- Lombok, Maven

### Frontend
- Angular 18 (standalone components)
- TypeScript
- SCSS (custom dark theme)
- RxJS

---

## 🎨 Design

Tema: **Cinema Dark** — fundal întunecat cu accente aurii (#e4a90a).  
Fonturi: **Bebas Neue** (titluri) + **Outfit** (body).  
Responsive design pentru desktop, tabletă și mobil.

---

## ⚙️ Configurare

### Backend (`application.properties`)
- `DATABASE_URL` — URL PostgreSQL
- `POSTGRES_USER` / `POSTGRES_PASSWORD` — credențiale DB
- `application.security.jwt.secret-key` — cheie JWT
- `movie.image.upload-dir` — director pentru imagini filme

### Frontend (`environments/environment.ts`)
- `apiUrl` — URL-ul backend-ului (default: `http://localhost:8080/api/v1`)
