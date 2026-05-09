# Travel Wishlist - Aplicatie Web Cloud Computing

**Nume:** Babes Ana Maria Cristina  
**Grupa:** 1145

---

**Link video prezentare:**
**Link publicare:** `https://github.com/anamria22/travel-wishlist-app`

---

## 1. Introducere

Travel Wishlist este o aplicatie web car permite utilizatorilor autentificati sa isi gestioneze o lista personala de destinatii de calatorie. Pentru fiecare destinatie adaugata, aplicatia afiseaza automat informatii meteo in timp real, locuri de vizitat si o fotografie reprezentativa a orasului.

---

## 2. Descriere problema

Calatorii isi doresc un loc centralizat unde sa isi salveze destinatiile dorite si sa acceseze rapid informatii relevante despre acestea: conditii meteo, atractii turistice si fotografii. Aplicatia rezolva aceasta nevoie prin combinarea mai multor servicii cloud intr-o interfata simpla si intuitiva, cu autentificare si persistenta a datelor.

---

## 3. Descriere API

Aplicatia integreaza urmatoarele servicii externe prin API REST

### Firebase (Google Cloud)

- **Firebase Authentication** - autentificare utilizatori prin email si parola
- **Cloud Firestore** - baza de date NoSQL in cloud pentru stocarea destinatiilor fiecarui utilizator

### Open-Meteo Geocoding API

- **Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`
- Converteste numele unui oras in coordonate geografice (latitudine, longitudine)
- Nu necesita autentificare (API public gratuit

### Open-Meteo Weather API

- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- Returneaza datele meteo curente pentru coordonatele geografice date: temperatura, umiditate, viteza vantului, cod conditie meteo
- Nu necesita autentificare (API public gratuit)

### Overpass API (OpenStreetMap)

- **Endpoint:** `https://overpass-api.de/api/interpreter`
- Returneaza locuri turistice (muzee, monumente, galerii, parcuri tematice etc.) in raza de 8 km fata de orasul selectat
- Nu necesita autentificare (API public gratuit)

### Unsplash API

- **Endpoint:** `https://api.unsplash.com/search/photos`
- Returneaza fotografii reprezentative pentru orasul selectat
- Necesita cheie API transmisa ca query parameter (`client_id`)

---

## 4. Flux de date

### Autentificare si persistenta

Utilizatorul se autentifica prin Firebase Authentication (email + parola). Dupa autentificare, sesiunea este pastrata automat de Firebase SDK la refresh-ul paginii, astfel incat utilizatorul ramane logat. Destinatiile sunt salvate in Cloud Firestore asociate cu `uid`-ul utilizatorlui si sunt incarcate in timp real prin `onSnapshot`.

### Adaugarea unei destinatii

1. Utilizatorul introduce numele orasului in campul de autocomplete
2. Se apeleaza **Open-Meteo Geocoding API** pentru sugestii in timp real
3. Utilizatorul selecteaza orasul dorit si apasa "Adauga"
4. Destinatia este salvata in **Cloud Firestore**

### Vizualizarea detaliilor

La selectarea unei destinatii din lista:

1. Se apeleaza **Unsplash API** pentru a obtine o fotografie a orasului
2. Se apeleaza **Open-Meteo Geocoding API** pentru coordonatele orasului
3. Se apeleaza **Open-Meteo Weather API** cu coordonatele obtinute pentru datele meteo
4. Se apeleaza **Overpass API** pentru lista de atractii turistice

### Exemple de request / response

**Geocoding - cautare oras:**

```
GET https://geocoding-api.open-meteo.com/v1/search?name=Paris&count=1&language=en

Response:
{
  "results": [
    {
      "name": "Paris",
      "latitude": 48.85341,
      "longitude": 2.3488,
      "country": "France",
      "country_code": "FR"
    }
  ]
}
```

**Weather - date meteo curente:**

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude=48.85&longitude=2.35
    &current=temperature_2m,relative_humidity_2m,apparent_temperature,
             wind_speed_10m,weathercode,visibility
    &wind_speed_unit=kmh&timezone=auto

Response:
{
  "current": {
    "temperature_2m": 18.3,
    "relative_humidity_2m": 62,
    "apparent_temperature": 17.1,
    "wind_speed_10m": 14.2,
    "weathercode": 2,
    "visibility": 24140
  }
}
```

**Overpass API - locuri turistice:**

```
POST https://overpass-api.de/api/interpreter
Body (Overpass QL):
[out:json][timeout:10];
(
  node["tourism"~"attraction|museum|gallery|monument"](around:8000,48.85,2.35);
);
out body 12;

Response:
{
  "elements": [
    {
      "id": 123456,
      "tags": {
        "name": "Musee du Louvre",
        "tourism": "museum",
        "website": "https://www.louvre.fr"
      }
    }
  ]
}
```

**Unsplash API - fotografie oras:**

```
GET https://api.unsplash.com/search/photos
    ?query=Paris+France&per_page=1&orientation=landscape&client_id=YOUR_KEY

Response:
{
  "results": [
    {
      "urls": { "regular": "https://images.unsplash.com/..." },
      "user": {
        "name": "John Doe",
        "links": { "html": "https://unsplash.com/@johndoe" }
      }
    }
  ]
}
```

### Metode HTTP utilizate

| API | Metoda | Scop |
|-----|--------|------|
| Open-Meteo Geocoding | GET | Cautare oras si coordonate |
| Open-Meteo Weather | GET | Date meteo curente |
| Overpass API | POST | Interogare locuri turistice |
| Unsplash API | GET | Fotografii oras |
| Firestore (SDK) | - | CRUD destinatii (gestionat de Firebase SDK) |

### Autentificare si autorizare servicii

- **Firebase:** autentificare cu email/parola prin Firebase Authentication SDK; datele din Firestore sunt protejate prin reguli de securitate bazate pe `uid`
- **Unsplash:** autentificare prin `client_id` (cheie API) transmis ca query parameter
- **Open-Meteo / Overpass:** API-uri publice, fara autentificare

---

## 5. Capturi ecran aplicatie
<img width="381" height="349" alt="Screenshot 2026-05-09 021432" src="https://github.com/user-attachments/assets/65885652-6143-4960-a6b9-2bb4c3dbbdeb" />

- **pagina de login/sign-up**

<img width="1865" height="932" alt="Screenshot 2026-05-09 021512" src="https://github.com/user-attachments/assets/354b5921-b98e-4016-9f38-dabbe5ac1b63" />

- **pagina principala - dashboard**

<img width="356" height="332" alt="Screenshot 2026-05-09 021718" src="https://github.com/user-attachments/assets/88a54cbd-ded1-4dc1-a764-6ed0ee6a4e4c" />
<img width="346" height="339" alt="Screenshot 2026-05-09 021743" src="https://github.com/user-attachments/assets/69c54d70-715b-4703-9c92-f01b74dd8964" />

- **introducere oras**

<img width="1863" height="944" alt="Screenshot 2026-05-09 021800" src="https://github.com/user-attachments/assets/7fad9857-5085-455f-8097-11c98a1babfa" />

- **afisare detalii oras, imagine, meteo**

<img width="1157" height="838" alt="Screenshot 2026-05-09 021819" src="https://github.com/user-attachments/assets/7e833c3d-902b-4a98-9692-3d23c0fdcbff" />
<img width="601" height="236" alt="Screenshot 2026-05-09 021854" src="https://github.com/user-attachments/assets/2fd0836c-e278-4b20-bac3-1b37c291d59e" />

- **afisare atractii turistice si hyperlynk catre o pagina de referinta**

<img width="1344" height="468" alt="Screenshot 2026-05-09 022522" src="https://github.com/user-attachments/assets/9426ff76-6e7b-4b41-a05f-e9b1f143ca3b" />

- **stocare date in firebase**

---

## 6. Functionalitati principale

- Autentificare cu email si parola (Firebase Authentication)
- Persistenta sesiunii la refresh al paginii
- Adaugare si stergere destinatii salvate in Cloud Firestore
- Autocomplete la introducerea numelui orasului prin Open-Meteo Geocoding
- Fotografie reprezentativa pentru orasul selectat prin Unsplash API
- Date meteo in timp real: temperatura, umiditate, vant, vizibilitate (Open-Meteo)
- Lista locuri de vizitat cu tip si iconita corespunzatoare (Overpass / OpenStreetMap)
- Link direct catre site-ul oficial sau pagina Wikipedia a atractiilor turistice, disponibil la click pe numele atractiei

---

## 7. Referinte

- [Firebase Documentation](https://firebase.google.com/docs)
- [Open-Meteo API](https://open-meteo.com/)
- [Overpass API](https://overpass-api.de/)
- [Unsplash Developers](https://unsplash.com/developers)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [OpenStreetMap](https://www.openstreetmap.org/)
