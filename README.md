# 🍽️ Pedidos del Día

Sistema interno de consolidación de pedidos de comida con gestión semanal, métricas y exportación a Excel.

---

## 🎨 Diseño

- **Tipografía:** Montserrat (Google Fonts)
- **Paleta corporativa:**
  - `#E81D2C` — Rojo primario (acciones, énfasis)
  - `#3E171B` — Marrón oscuro (textos, encabezados)
  - `#A1CE5E` — Verde (confirmaciones, éxito)
  - `#666666` — Gris (textos secundarios)
  - `60% Blanco / Gris suave` — Fondos y superficies
- **Estilo:** Minimalista corporativo, bordes rectos, tablas limpias

---

## 👥 Usuarios y credenciales

| Usuario  | Contraseña | Rol          | Acceso |
|----------|-----------|--------------|--------|
| Juanito  | `12345`   | Colaborador  | Nuevo Pedido, Mi Semana, Mis Pedidos |
| Pedrito  | `12345`   | Colaborador  | Nuevo Pedido, Mi Semana, Mis Pedidos |
| Panchito | `12345`   | Colaborador  | Nuevo Pedido, Mi Semana, Mis Pedidos |
| Mariana  | `12345`   | Coordinadora | Todo + Métricas, Consolidado, Por Colaborador |

---

## 🏪 Restaurantes disponibles

- San Martin
- The Kitchen
- Pollo Campero
- McDonald's
- Celeste Imperio

---

## ✨ Funcionalidades

### Colaboradores
- **Nuevo Pedido** — Selección de restaurante, plato, cantidad, observaciones y fecha
- **Mi Semana** — Programación de pedidos lunes a viernes de una sola vez
- **Mis Pedidos** — Historial personal con estadísticas (total, semana, restaurantes, unidades)

### Coordinadora (Mariana)
- **Métricas** — KPIs globales, barras de progreso por colaborador, gráficas de barras y pastel, heatmap de semana
- **Consolidado** — Todos los pedidos agrupados por día con tabla resumen por restaurante y exportación a Excel
- **Por Colaborador** — Vista individual de pedidos de cada persona con tabla detallada

---

## 📊 Exportación Excel

El botón **"Exportar Excel"** (solo Mariana) genera un archivo `.xlsx` con 3 hojas:
1. **Todos los Pedidos** — Lista completa ordenada por fecha
2. **Consolidado** — Agrupado por plato con totales y detalle por persona
3. **Una hoja por colaborador** (Juanito, Pedrito, Panchito)

---

## 💾 Almacenamiento

Los datos se guardan automáticamente en `localStorage` del navegador bajo la clave `pedidos_corp_v1`. No requiere base de datos ni servidor.

---

## 🚀 Publicar en GitHub Pages

### Opción 1 — Subir archivos directamente

1. Crea un repositorio nuevo en GitHub (ej. `pedidos-del-dia`)
2. Sube los dos archivos:
   - `index.html`
   - `styles.css`
3. Ve a **Settings → Pages**
4. En **Source**, selecciona `Deploy from a branch`
5. Elige la rama `main` y carpeta `/ (root)`
6. Haz clic en **Save**
7. En 1-2 minutos tu app estará en:
   ```
   https://TU_USUARIO.github.io/pedidos-del-dia/
   ```

### Opción 2 — Usando Git desde terminal

```bash
# 1. Clona o inicializa el repositorio
git init
git remote add origin https://github.com/TU_USUARIO/pedidos-del-dia.git

# 2. Agrega los archivos
git add index.html styles.css README.md

# 3. Commit inicial
git commit -m "feat: sistema de pedidos del día v1"

# 4. Sube a main
git branch -M main
git push -u origin main
```

Luego activa GitHub Pages desde **Settings → Pages → Branch: main → Save**.

---

## 🌐 Dependencias CDN

La aplicación carga estas librerías automáticamente (requiere internet la primera vez):

| Librería   | Versión | Uso |
|-----------|---------|-----|
| React     | 18.2.0  | Framework de UI |
| ReactDOM  | 18.2.0  | Renderizado |
| Babel     | 7.23.2  | Compilación JSX en navegador |
| SheetJS   | 0.18.5  | Exportación Excel |
| Recharts  | 2.8.0   | Gráficas y métricas |

---

## 📁 Estructura del proyecto

```
pedidos-del-dia/
├── index.html     ← Aplicación completa (React + lógica)
├── styles.css     ← Estilos corporativos (Montserrat + paleta)
└── README.md      ← Este archivo
```

---

## 🔧 Personalización

Para cambiar usuarios, contraseñas o restaurantes, edita las constantes al inicio de `index.html`:

```javascript
const ACCOUNTS = {
  NuevoUsuario: { password: "nueva_clave", role: "user", avatar: "NU", color: "#E81D2C", ... },
};

const RESTAURANTS = ["Restaurante A", "Restaurante B", ...];
```

---

*Sistema interno · Todos los derechos reservados*
