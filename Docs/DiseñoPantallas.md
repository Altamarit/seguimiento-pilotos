# Design System – Pilotos IA Dashboard

## 1. Fundación visual

### Tipografía

- **Font family principal**
  - `Inter`, `SF Pro Text`, `system-ui`, sans-serif
- Jerarquía
  - H1 (títulos de página): 24px, semibold, color `#101828`
  - H2 (títulos de sección / cards): 18px, semibold, color `#101828`
  - Body principal: 14–15px, regular, color `#344054`
  - Labels / metadatos: 12–13px, medium, color `#667085`

### Paleta de color

- Neutros
  - `bg-page`: `#F5F5F7`
  - `bg-surface`: `#FFFFFF`
  - `border-subtle`: `#E4E7EC`
  - `text-main`: `#101828`
  - `text-secondary`: `#667085`
  - `icon-muted`: `#98A2B3`

- Primarios
  - `primary`: `#2563EB`
  - `primary-soft`: `#EFF4FF`
  - `primary-border`: `#D0E2FF`

- Estado (badges / barras timeline)
  - Planificado: `#64748B`
  - En marcha: `#2563EB`
  - Finalizado: `#16A34A`
  - Cancelado: `#DC2626`

- Semánticos
  - Éxito suave fondo: `#ECFDF3`, texto: `#16A34A`
  - Peligro suave fondo: `#FEF3F2`, texto: `#DC2626`

### Espaciado y radii

- Espaciado
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 12px
  - `lg`: 16px
  - `xl`: 24px
  - `xxl`: 32px

- Bordes y sombras
  - `radius-xs`: 4px
  - `radius-md`: 8px
  - Cards / modals: 8px
  - Sombra cards: `0 1px 3px rgba(15, 23, 42, 0.06)`

---

## 2. Layout global

### Shell de aplicación

- Sidebar izquierda
  - Ancho: 240px
  - Fondo: `#FFFFFF`
  - Borde derecha: `1px solid #E4E7EC`
  - Items:
    - Logo pequeño arriba
    - Secciones: “Pilotos”, “Administración” (solo Admin)
  - Estado activo:
    - Fondo `primary-soft`
    - Texto `primary`
    - Icono en `primary`

- Top bar
  - Altura: 64px
  - Fondo: `#FFFFFF`
  - Borde inferior: `1px solid #E4E7EC`
  - Contenido:
    - Izquierda: título de página (H1)
    - Derecha: filtros, toggle vista, botón “Añadir piloto”

- Área de contenido
  - Fondo: `bg-page`
  - Contenedor:
    - Max-width: 1200–1280px
    - Centrado
    - Padding: `24px` vertical y horizontal

---

## 3. Componentes clave

### 3.1 Cards de KPI

- Contenedor
  - Fondo: `bg-surface`
  - Borde: `1px solid border-subtle`
  - Radio: `radius-md`
  - Padding: `16px 16px`
- Contenido
  - Label:
    - 12px
    - `text-secondary`
  - Valor:
    - 24px
    - Semibold
    - `text-main`
  - Delta (opcional):
    - Pill pequeña con fondo `primary-soft`
    - Texto `primary`

### 3.2 Tabla de pilotos (vista lista)

- Tabla
  - Header:
    - Fondo: `#F9FAFB`
    - Texto: 12px, `text-secondary`
  - Filas:
    - Fondo base: `bg-surface`
    - Hover: `#F9FAFB`
    - Borde inferior: `1px solid border-subtle`
    - Altura mínima: 56–60px

- Celdas
  - Primera columna:
    - Nombre piloto: 14–15px, semibold, `text-main`
    - Objetivo funcional: 13px, `text-secondary`, segunda línea
  - Estado:
    - Badge pill:
      - Fondo según estado (suave)
      - Texto más oscuro del mismo tono
      - Padding: `4px 8px`
      - Radio: `999px`
  - Campos numéricos:
    - Alineación derecha

- Interacción
  - La fila es clicable para abrir el detalle del piloto.
  - La edición del piloto se realiza desde la pantalla de detalle para simplificar el MVP.

### 3.3 Toggle Lista / Cronológica

- Contenedor
  - Fondo: `#F2F4F7`
  - Radio: `999px`
  - Padding: 2px
- Opción activa
  - Fondo: `#FFFFFF`
  - Texto: `#101828`, semibold
- Opción inactiva
  - Texto: `#667085`

---

## 4. Vista cronológica (Gantt ligero)

- Área timeline
  - Fondo: `bg-surface`
  - Borde: `1px solid border-subtle`
  - Radio: `radius-md`
  - Padding: `16px`

- Eje temporal
  - Líneas verticales: `#E4E7EC`
  - Labels fechas: 12px, `text-secondary`

- Barras de piloto
  - Altura: 16px
  - Radio: `999px`
  - Colores:
    - Planificado: fondo `#E2E8F0`
    - En marcha: fondo `#DBEAFE`, borde `#2563EB`
    - Finalizado: fondo `#DCFCE7`, borde `#16A34A`
    - Cancelado: fondo `#FEE2E2`, borde `#DC2626`
  - Tooltip:
    - Fondo: `#1F2933`
    - Texto: `#FFFFFF`
    - Radio: 8px
    - Sombra: `0 10px 40px rgba(15, 23, 42, 0.24)`

---

## 5. Detalle de piloto

### Encabezado

- Izquierda
  - Nombre del piloto: H1 24px, semibold, `text-main`
  - Objetivo funcional: 13–14px, `text-secondary`
  - Línea meta: 12px, `text-secondary` con “Estado · Fecha inicio – Fecha fin”
- Derecha
  - Badge de estado (pill)
  - Botón primario “Guardar” cuando haya cambios (Editor/Admin)

### KPIs del piloto

- Dos cards horizontales (igual estilo KPIs globales)
  - Card 1: “Personas formadas (piloto)”
    - Muestra un valor manual editable por Editor/Admin
  - Card 2: “Mejora productividad”

### Timeline de eventos

- Columna izquierda
  - Línea vertical: `#E4E7EC`
  - Nodo evento: círculo 8px, relleno `primary`
- Tarjeta evento
  - Fondo: `bg-surface`
  - Borde: `1px solid border-subtle`
  - Radio: 8px
  - Padding: 12px
  - Contenido:
    - Fecha: 12px, `text-secondary`
    - Tipo: badge pequeño (Formación, Productividad, Otro)
    - Descripción: 14px, `text-main`
    - Valor numérico destacado: semibold (`+20 personas en el evento`, `18 %`)

- Acciones (Editor/Admin)
  - Iconos editar / borrar
  - Color base: `icon-muted`
  - Hover: `text-secondary`

---

## 6. Modales y formularios

### Modal “Añadir / Editar evento”

- Contenedor
  - Max-width: 480px
  - Fondo: `bg-surface`
  - Radio: 12px
  - Sombra: `0 10px 40px rgba(15, 23, 42, 0.16)`
  - Padding: 24px

- Estructura
  - Título: 18px, semibold
  - Campos:
    - Labels: 12px, `text-secondary`
    - Inputs:
      - Altura: 40px
      - Borde: `#D0D5DD`
      - Radio: 8px
      - Padding horizontal: 10–12px
    - Si el tipo es “Formación”, el formulario muestra el campo “Nº de personas formadas en este evento”
  - Footer:
    - Botón primario: fondo `primary`, texto `#FFFFFF`
    - Botón secundario/ghost: texto `text-secondary`, sin borde o borde sutil

---

## 7. Estados vacíos y mensajes

### Home sin pilotos

- Card central
  - Icono outline suave
  - Título: “Todavía no hay pilotos”
  - Texto: breve y claro
  - Botón primario: “Crear primer piloto” (solo Editor/Admin)

### Timeline sin eventos

- Texto:
  - “Aún no hay eventos de impacto para este piloto”
- Botón:
  - “Añadir evento de impacto” (solo Editor/Admin)
