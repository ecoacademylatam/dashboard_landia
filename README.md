# 🌿 Landia — Dashboard de Huella de Carbono

Dashboard interactivo de la Auditoría de Huella de Carbono del Festival Landia 2026.  
**Scope 3, Categoría 7 — Desplazamiento de Asistentes**  
GHG Protocol · ISO 20121:2024 · ISO 14064-1:2018 · UK DECCA 2025

---

## 🚀 Deploy en Vercel (opción recomendada)

### Requisitos
- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

### Pasos

**1. Subir a GitHub**

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Landia Carbon Dashboard v1"
git branch -M main

# Crear repo en github.com → New repository → "landia-dashboard"
git remote add origin https://github.com/TU_USUARIO/landia-dashboard.git
git push -u origin main
```

**2. Conectar con Vercel**

1. Ir a [vercel.com/new](https://vercel.com/new)
2. "Import Git Repository" → seleccionar `landia-dashboard`
3. Framework: **Create React App** (se detecta automáticamente)
4. Click **Deploy** → listo en ~2 minutos

Tu sitio queda en: `https://landia-dashboard.vercel.app`

---

## 🌐 Conectar tu dominio propio

### En Vercel
1. Settings → Domains → Add Domain
2. Escribir tu dominio (ej: `sostenibilidad.festivallandia.com.ar`)
3. Vercel te da 2 registros DNS

### En tu registrador (NIC.ar / Donweb / Namecheap / etc.)
Agregar los registros que te indica Vercel:

| Tipo   | Nombre | Valor                       |
|--------|--------|-----------------------------|
| A      | @      | `76.76.21.21`               |
| CNAME  | www    | `cname.vercel-dns.com`      |

En 10–60 minutos propaga. HTTPS incluido automáticamente.

---

## 💻 Desarrollo local

```bash
npm install
npm start
# Abre http://localhost:3000
```

## 🏗️ Build para producción

```bash
npm run build
# Genera carpeta /build lista para cualquier hosting estático
```

---

## 📁 Estructura

```
landia-web/
├── public/
│   └── index.html          # HTML base con meta tags y OG
├── src/
│   ├── index.js            # Entry point React
│   └── App.js              # Dashboard completo (recharts)
├── vercel.json             # Config de routing
├── package.json
└── README.md
```

---

## 📊 Contenido del dashboard

| Pestaña | Contenido |
|---------|-----------|
| 🚗 Transporte | Distribución modal, emisiones por modo, escenarios |
| 🌿 Equivalencias | Vuelos, algarrobos, km — con fuentes citadas |
| 📐 Marco Estadístico | Curva de error, tabla Israel, declaración metodológica |
| 🎯 Comportamiento | Bebidas, actividades, social media, telco |
| 📱 Sponsors | Radar de oportunidades + mapa de marcas Argentina |

---

*Auditoría elaborada bajo GHG Protocol Corporate Standard, ISO 20121:2024 e ISO 14064-1:2018.*  
*Córdoba, Argentina — Marzo 2026*
