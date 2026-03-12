# Casos de Uso – Pilotos IA Agentica

## CU-01 – Consultar estado de pilotos de IA

**Nombre**  
CU-01 – Consultar estado de pilotos de IA

**Actor principal**  
Responsable de Innovación / IA

**Objetivo**  
Ver de un vistazo todos los pilotos en marcha, su estado, fechas y métricas clave (personas formadas y % mejora productividad), en vista lista o cronológica tipo Gantt ligero. [web:78][web:99]

**Precondiciones**

- Usuario autenticado. [web:47]
- Existen pilotos creados con:
  - Nombre.
  - Objetivo funcional.
  - Fechas (inicio/fin).
  - Estado.
  - Métricas básicas (pueden estar vacías).

**Flujo principal (happy path)**

1. El actor accede a la home del dashboard tras login.
2. El sistema muestra en la parte superior KPIs globales:
   - Nº de pilotos activos (estado = “en marcha”).
   - Total de personas formadas, calculado como suma del valor manual de cada piloto.
   - Media de % mejora de productividad. [web:67]
3. Debajo, el sistema muestra por defecto la **vista Lista** (tabla minimalista) de pilotos, con columnas:
   - Nombre del piloto.
   - Objetivo funcional (resumen).
   - Estado.
   - Fecha inicio.
   - Fecha fin.
   - Personas formadas.
   - % mejora productividad. [web:59][web:81]
4. El actor puede usar un **toggle** para cambiar entre:
   - Vista “Lista”.
   - Vista “Cronológica”, donde los pilotos aparecen como barras sobre una línea de tiempo tipo Gantt simplificado. [web:78]
5. En la vista cronológica, el actor ve los pilotos distribuidos en el tiempo y puede identificar solapes y huecos.
6. En ambas vistas, el actor puede filtrar por:
   - Estado.
   - Rango de fechas (ej.: este trimestre). [web:99]
7. El actor hace clic en un piloto para abrir la ficha de detalle (CU-02 – Ver detalle de piloto).

**Variantes / extensiones**

- 3a. Si el usuario cambia de vista, el sistema recuerda la última vista usada para futuras sesiones.
- 4a. En la vista cronológica, hover sobre barra muestra tooltip con objetivo corto, personas formadas, % productividad.
- 2a. Si no hay métricas suficientes, se muestran como 0 o “—”, manteniendo el layout.

**Comportamiento por rol**

- Lector:
  - Solo lectura.
  - Puede ordenar, filtrar, navegar a detalle.
- Editor / Admin:
  - Además, puede:
    - Ver botón “Añadir piloto” que crea un nuevo piloto y redirige a su detalle. [web:93]
    - Editar pilotos desde la pantalla de detalle.

**Postcondiciones de éxito**

- El actor tiene visión clara de los pilotos tanto en lista como en timeline.
- Sabe qué pilotos requieren revisión o actualización.

---

## CU-02 – Ver detalle de piloto de IA

**Nombre**  
CU-02 – Ver detalle de piloto de IA

**Actor principal**  
Responsable de Innovación / IA

**Objetivo**  
Consultar rápidamente la ficha de un piloto concreto, con su objetivo funcional, estado, fechas, métricas de impacto y eventos de impacto más relevantes. [web:78][web:95]

**Precondiciones**

- Usuario autenticado. [web:47]
- El piloto existe y tiene al menos nombre, objetivo funcional, fechas y estado.

**Flujo principal (happy path)**

1. El actor llega a la ficha del piloto desde CU-01 (clic en lista o timeline).
2. El sistema muestra un encabezado con:
   - Nombre del piloto (título principal).
   - Objetivo funcional (subtítulo).
   - Estado.
   - Fecha inicio y fin. [web:81]
3. El sistema muestra dos KPIs grandes:
   - Nº total de personas formadas asociadas al piloto, introducido manualmente.
   - % mejora de productividad alcanzada (último valor). [web:67][web:71]
4. El sistema muestra una sección “Eventos de impacto” en formato mini-timeline vertical:
   - Cada evento incluye:
     - Fecha.
     - Tipo (Formación / Productividad / Otro).
     - Descripción corta.
     - Valor relevante (nº personas formadas, % productividad). [web:38][web:39]
5. El actor recorre el timeline para entender la historia del piloto.
6. El actor puede volver a la vista anterior (lista o cronológica) mediante botón “Volver”.

**Variantes / extensiones**

- 3a. Sin métricas: KPIs aparecen como 0 o “N/D”, con CTA a crear primer evento.
- 4a. Si hay muchos eventos, se muestran los últimos 3–5 con opción “Ver todos”.
- 2a. Puede mostrarse la cuenta como meta-información secundaria, sin peso visual.

**Comportamiento por rol**

- Lector:
  - Campos en modo lectura.
  - No puede crear ni editar eventos.
- Editor / Admin:
  - Campos del piloto (nombre, objetivo, estado, fechas y personas formadas) editables.
  - Puede:
    - Crear evento (“Añadir evento de impacto”).
    - Editar/borrar eventos existentes.

**Postcondiciones**

- El actor entiende el contexto, impacto y hitos del piloto.
- Puede decidir registrar nuevos eventos o actualizar métricas.

---

## CU-03 – Crear / editar piloto

**Nombre**  
CU-03 – Crear / editar piloto

**Actor principal**  
Editor / Admin

**Objetivo**  
Crear nuevos pilotos IA y actualizar los existentes, reutilizando la pantalla de detalle como formulario. [web:123]

**Precondiciones**

- Usuario autenticado con rol Editor o Admin.
- Acceso a la vista Home (CU-01) o a detalle de piloto.

**Flujo principal (crear)**

1. Desde la vista Home (lista), el actor pulsa “Añadir piloto”.
2. El sistema crea un nuevo registro con valores por defecto:
   - Estado = planificado.
   - Fechas en blanco o fecha inicio = hoy.
3. El sistema abre la pantalla de detalle del nuevo piloto en modo edición.
4. El actor rellena:
   - Nombre del piloto (obligatorio).
   - Objetivo funcional.
   - Estado.
   - Fechas de inicio y fin.
   - Personas formadas (opcional, dato manual).
5. El actor pulsa “Guardar”.
6. El sistema valida (ej.: fecha fin ≥ fecha inicio) y guarda. [web:120]

**Flujo principal (editar)**

1. Desde Home o detalle, el actor modifica campos editables.
2. El sistema habilita botón “Guardar” si hay cambios.
3. Al guardar, se actualiza el registro.

**Variantes / extensiones**

- Validaciones adicionales (por ejemplo, no permitir estado “finalizado” sin fecha fin).
- Mensajes de éxito/errores sutiles en UI.

**Postcondiciones**

- El piloto aparece en lista y cronológica según sus fechas.
- Los cambios se reflejan de inmediato en KPIs y vistas correspondientes.

---

## CU-04 – Añadir / editar evento de impacto

**Nombre**  
CU-04 – Añadir / editar evento de impacto

**Actor principal**  
Editor / Admin

**Objetivo**  
Registrar eventos de impacto de formación o productividad asociados a un piloto. [web:39]

**Precondiciones**

- Usuario autenticado con rol Editor o Admin.
- Piloto existente.

**Flujo principal (añadir)**

1. En detalle de piloto, el actor pulsa “Añadir evento de impacto”.
2. Se abre un modal con campos:
   - Tipo: Formación / Productividad / Otro.
   - Fecha del evento.
   - Valor:
     - Formación: nº personas formadas.
     - Productividad: % mejora productividad.
   - Descripción breve. [web:65][web:69]
3. El actor rellena los campos y pulsa “Guardar”.
4. El sistema crea el evento y lo añade al timeline.
5. Si el evento es de Productividad, el sistema actualiza el KPI de productividad del piloto.
6. Si el evento es de Formación, el sistema guarda cuántas personas se formaron en ese evento como dato histórico, sin recalcular automáticamente el KPI manual de personas formadas del piloto.

**Flujo (editar/borrar)**

1. El actor usa icono de editar en un evento.
2. Se abre modal con los campos existentes.
3. Tras editar, pulsa “Guardar”.
4. El sistema actualiza el evento y, si aplica, el KPI de productividad asociado.
5. Borrado: icono de borrar → confirmación → evento eliminado y, si aplica, KPI de productividad recalculado.

**Postcondiciones**

- El timeline refleja el nuevo estado de los eventos.
- KPIs están alineados con la nueva información.

---

## CU-05 – Gestionar usuarios y roles

**Nombre**  
CU-05 – Gestionar usuarios y roles

**Actor principal**  
Admin

**Objetivo**  
Asignar roles (Lector, Editor, Admin) a los usuarios del sistema. [web:47][web:123]

**Precondiciones**

- Usuario autenticado con rol Admin.

**Flujo principal**

1. El Admin accede a “Administración” desde el sidebar.
2. El sistema muestra tabla de usuarios con columnas:
   - Email / nombre.
   - Rol actual.
3. El Admin usa un dropdown para cambiar el rol de un usuario:
   - Lector / Editor / Admin.
4. El sistema guarda el cambio y lo aplica en tiempo real.

**Reglas**

- Todos los usuarios nuevos entran como Lector por defecto.
- Solo Admin puede cambiar roles.
- (Recomendado) No permitir que el sistema se quede sin ningún Admin.

**Postcondiciones**

- El usuario afectado tiene nuevos permisos en las otras pantallas (puede o no editar según rol).

---
