# PRD – Dashboard de Pilotos IA Agentica

## 1. Visión y contexto

### 1.1. Visión del producto
Crear un dashboard interno que permita al equipo de innovación seguir de forma clara y minimalista los proyectos piloto de IA (IA agéntica), ver su estado y entender su impacto en formación y productividad, usando Next.js + Supabase + Vercel. [web:81][web:120]

### 1.2. Problema a resolver
- Hoy el seguimiento de pilotos IA se hace de forma dispersa (hojas, slides, conversaciones), dificultando:
  - Saber qué pilotos están activos y en qué estado están.
  - Comunicar rápidamente el impacto de cada piloto (personas formadas, mejora de productividad).
  - Priorizar en qué pilotos intervenir o escalar. [web:95][web:99]

### 1.3. Objetivos del MVP
- Proporcionar una vista centralizada de todos los pilotos IA activos y su estado.
- Capturar y visualizar métricas clave:
  - Nº de personas que han aprendido IA por piloto.
  - % de mejora de productividad por piloto.
- Permitir registrar eventos de impacto de forma sencilla (formación, medición de productividad).
- Ajustarse a un look & feel minimalista tipo dashboard B2B (inspiración ChartMogul CRM). [web:81][web:100]

### 1.4. Usuarios y roles

#### Usuarios principales
- **Responsable de Innovación / IA**  
  - Uso casi diario.  
  - Necesita: ver el estado de todos los pilotos, actualizar información clave e introducir eventos de impacto. [web:95]

#### Usuarios secundarios
- **Dirección / Comité**  
  - Uso mensual o puntual.  
  - Necesita: ver impacto agregado y entender rápidamente qué pilotos están funcionando mejor.

#### Roles de aplicación
- **Lector (por defecto)**  
  - Puede ver todas las vistas y datos.  
  - No puede crear ni editar pilotos ni eventos.
- **Editor**  
  - Puede crear y editar pilotos.  
  - Puede crear, editar y borrar eventos de impacto.
- **Admin**  
  - Tiene permisos de Editor.  
  - Puede asignar roles a otros usuarios. [web:47][web:120]

---

## 2. Alcance del MVP

### 2.1. Incluido en MVP

- Autenticación con Supabase Auth.
- Gestión de usuarios con roles (Lector, Editor, Admin) asignados por Admin.
- Módulo de pilotos IA:
  - Listado de pilotos en vista tabla.
  - Vista cronológica tipo Gantt ligero de pilotos.
  - Detalle de piloto con métricas y eventos de impacto.
- Módulo de eventos de impacto:
  - Registro de eventos de formación.
  - Registro de eventos de productividad.
- KPIs globales:
  - Nº de pilotos activos.
  - Total personas formadas.
  - Mejora de productividad media (en %).
- Diseño visual minimalista, con layout tipo dashboard B2B (sidebar + top bar + cards + tablas). [web:81][web:100]

### 2.2. Fuera de alcance MVP

- Integraciones con LMS, HR o herramientas de productividad (todo es entrada manual).
- Analítica avanzada (cohortes, exportaciones, gráficos complejos).
- Gestión económica (ROI monetario, ahorros en €).
- Gestión de adjuntos/documentación (solo enlaces si se quisiera añadir más adelante).
- Notificaciones, recordatorios automáticos o workflows. [web:120][web:123]

---

## 3. Funcionalidades principales

### 3.1. Home / Pilotos – Vista combinada (CU-01)

**Descripción**  
Pantalla principal tras login. Muestra KPIs globales y una vista de pilotos IA con toggle entre lista y cronológica. [web:95][web:99]

**Requisitos funcionales**

1. Mostrar KPIs globales:
   - Nº de pilotos activos (estado = “en marcha”).
   - Total acumulado de personas formadas (suma del campo manual “personas formadas” de cada piloto).
   - Media de % mejora de productividad entre pilotos que tengan dato, tomando el último valor de productividad registrado por piloto. [web:67]

2. Vista Lista (por defecto):
   - Tabla de pilotos con columnas:
     - Nombre del piloto.
     - Objetivo funcional (resumen).
     - Estado (planificado/en marcha/finalizado/cancelado).
     - Fecha inicio.
     - Fecha fin.
     - Personas formadas.
     - % mejora productividad.
   - Ordenación por:
     - Por defecto: “en marcha” primero, luego fecha de inicio descendente.
   - Filtros:
     - Por estado.
     - Por rango de fechas (inicio/fin dentro de rango).
   - Comportamiento por rol:
     - Lector: solo lectura, puede ordenar/filtrar y navegar al detalle.
     - Editor/Admin:
      - Botón “Añadir piloto” que crea un nuevo piloto y redirige a la pantalla de detalle.
      - Posibilidad de editar pilotos entrando en su pantalla de detalle. [web:81][web:93]

3. Vista Cronológica (Gantt ligero):
   - Toggle para cambiar entre “Lista” y “Cronológica” (estado recordable por usuario).
   - Eje temporal horizontal (ej.: meses).
   - Cada piloto representado como barra desde fecha inicio a fecha fin, coloreada por estado.
   - Hover sobre barra: tooltip con nombre, objetivo corto, personas formadas, % productividad.
   - Clic en barra: navegación a detalle de piloto.
   - Filtros por estado y rango de fechas aplican igualmente. [web:78][web:99]

**Criterios de aceptación (ejemplos)**
- Al cambiar entre vista Lista y Cronológica, los filtros vigentes se mantienen.
- Un usuario Lector nunca ve controles de edición ni el botón “Añadir piloto”.
- Un Editor puede cambiar el estado de un piloto desde el detalle y el cambio se refleja inmediatamente en la lista y en el timeline.

---

### 3.2. Detalle de piloto (CU-02)

**Descripción**  
Pantalla con el contexto y métricas de un piloto concreto, con su mini-timeline de eventos de impacto. [web:95]

**Requisitos funcionales**

1. Encabezado del piloto:
   - Mostrar:
     - Nombre del piloto (campo principal).
     - Objetivo funcional.
     - Estado.
     - Fecha inicio y fin.
   - Roles:
     - Lector: campos en modo lectura.
     - Editor/Admin: nombre, objetivo, estado y fechas editables en línea. [web:81]

2. KPIs del piloto:
   - Card “Personas formadas (piloto)”.
   - Card “Mejora productividad (piloto)”.
   - Personas formadas: valor manual editable a nivel de piloto.
   - Los eventos de tipo Formación pueden incluir cuántas personas se formaron en ese evento, pero ese dato no recalcula automáticamente el KPI del piloto.
   - Mejora productividad: último valor registrado en eventos de tipo Productividad del piloto. [web:67][web:71]

3. Eventos de impacto (mini-timeline):
   - Lista de eventos ordenada por fecha (más reciente arriba).
   - Cada evento incluye:
     - Fecha.
     - Tipo: Formación / Productividad / Otro.
     - Descripción corta.
     - Valor numérico relevante (ej.: nº personas formadas en ese evento, % productividad actualizado). [web:38][web:39]
   - Roles:
     - Lector:
       - Solo lectura.
     - Editor/Admin:
       - Botón “Añadir evento de impacto”.
       - Posibilidad de editar y borrar eventos existentes.

4. Navegación:
   - Botón “Volver” que regresa a la vista de Home en el mismo modo (lista o cronológica) desde el que se llegó.

**Criterios de aceptación (ejemplos)**
- El timeline muestra por defecto los últimos 3–5 eventos, con opción “Ver todos” si hay muchos.
- Si un piloto no tiene eventos, se muestra un estado vacío y, si el usuario es Editor/Admin, un CTA “Añadir primer evento de impacto”.

---

### 3.3. Crear / editar piloto (reutilizando detalle)

**Descripción**  
Uso de la pantalla de detalle como formulario de creación de piloto para simplificar. [web:123]

**Requisitos funcionales**

1. Al pulsar “Añadir piloto” (Editor/Admin):
   - Se crea un registro nuevo con estado inicial (ej.: planificado).
   - Se lleva al usuario a la pantalla de detalle de ese piloto en modo edición.

2. Campos mínimos requeridos:
   - Nombre del piloto (obligatorio).
   - Objetivo funcional (recomendado).
   - Estado (por defecto: planificado).
   - Fechas (inicio y, opcionalmente, fin).
   - Personas formadas (opcional, editable manualmente).  

3. Guardado:
   - Botón “Guardar” o guardado automático según patrón que se defina (recomendable botón explícito para MVP).
   - Validaciones básicas (ej.: fecha fin >= fecha inicio).

**Criterios de aceptación**
- No se puede dejar un piloto sin nombre.
- Los pilotos nuevos aparecen en la lista y, si tienen fechas, en la vista cronológica.

---

### 3.4. Añadir / editar evento de impacto (CU-04)

**Descripción**  
Permite registrar eventos de formación o productividad asociados a un piloto. [web:39]

**Requisitos funcionales**

1. Apertura:
   - Desde detalle de piloto, botón “Añadir evento de impacto” (solo Editor/Admin).
   - Desde un evento existente, icono de edición (solo Editor/Admin).

2. Campos:
   - Tipo (select): Formación / Productividad / Otro.
   - Fecha del evento.
   - Valor numérico:
     - Si Formación: nº personas formadas en ese evento.
     - Si Productividad: % mejora productividad, interpretado como valor actual del piloto en esa fecha.
   - Descripción breve (texto corto). [web:65][web:69]

3. Guardado:
   - Crear un nuevo registro de evento vinculado al piloto.
   - Actualizar KPIs del piloto según esta lógica:
     - Personas formadas: se mantiene como campo manual del piloto y no se recalcula automáticamente desde eventos.
     - % productividad: último valor de eventos de productividad.

4. Borrado:
   - Editor/Admin puede borrar eventos.
   - Al borrar, recalcular el KPI de productividad si se ve afectado.

**Criterios de aceptación**
- Un Lector no ve el botón “Añadir evento” ni los iconos de edición/borrado.
- El nuevo evento aparece inmediatamente en la parte superior del timeline.

---

### 3.5. Gestión de usuarios y roles (CU-05)

**Descripción**  
Pantalla para que Admin gestione los roles de los usuarios. [web:47][web:123]

**Requisitos funcionales**

1. Acceso:
   - En el sidebar, entrada “Administración” visible solo para Admin.

2. Contenido:
   - Tabla de usuarios con:
     - Email / nombre.
     - Rol actual.
     - Selector para cambiar rol (Lector / Editor / Admin).

3. Lógica de negocio:
   - Usuarios nuevos se crean como Lector por defecto.
   - Solo Admin puede cambiar el rol de un usuario.
   - No se permite dejar el sistema sin al menos un Admin (regla opcional recomendada).

**Criterios de aceptación**
- Un Editor o Lector no puede acceder a la pantalla de administración.
- Cambios de rol se reflejan en las otras pantallas (controles que aparecen/desaparecen).

---

## 4. Requisitos no funcionales

### 4.1. Tecnología

- Frontend: Next.js (App Router recomendado).
- Backend / BBDD: Supabase (Postgres) con RLS para control de acceso. [web:120][web:123]
- Hosting: Vercel para frontend; Supabase gestionado para backend.
- Estilos: diseño tipo SaaS dashboard minimalista, inspirado en ChartMogul CRM. [web:81][web:100]

### 4.2. Seguridad y acceso

- Autenticación con Supabase Auth.
- Autorización a nivel de rol (Lector, Editor, Admin) aplicada en:
  - UI (mostrar/ocultar acciones).
  - BBDD (RLS en tablas de pilotos y eventos, según rol). [web:120]
- Cumplimiento básico de buenas prácticas (HTTPS, passwords gestionados por Supabase, etc.).

### 4.3. Rendimiento y escalabilidad

- Diseño pensado inicialmente para pocos pilotos (hasta ~10–20), pero con modelo de datos preparado para crecer.
- Carga de Home en < 1 segundo en condiciones normales (pocos datos).
- Consultas optimizadas con índices en campos de filtrado (estado, fechas). [web:120][web:123]

---

## 5. Métricas de éxito

- Adopción interna:
  - Nº de usuarios activos (Responsables de innovación) por semana.
- Uso del producto:
  - Nº de pilotos creados y con métricas de impacto rellenadas.
  - Nº de eventos de impacto registrados por mes. [web:122]
- Calidad de seguimiento:
  - % de pilotos “en marcha” que tienen al menos un evento de impacto.
  - Feedback cualitativo del equipo de innovación (claridad, rapidez para entender el estado). [web:119][web:125]

---

## 6. Supuestos y riesgos

### 6.1. Supuestos

- Los datos de formación y productividad están disponibles aunque sea de forma aproximada y se pueden introducir manualmente.
- El equipo de innovación está dispuesto a mantener los pilotos actualizados.
- No hay necesidades inmediatas de integración con sistemas externos en el MVP. [web:120][web:123]

### 6.2. Riesgos

- Riesgo de baja adopción si la carga de datos resulta pesada (mitigar con UX simple y pocos campos obligatorios).
- Riesgo de interpretación de la productividad (%), si no se define claramente qué significa por piloto.
- Riesgo de “scope creep” hacia funciones de project management completas (tareas, recursos, etc.), que no están en el MVP. [web:119][web:123]
