# Increment 1

## Cambios en login

- [x] La pantalla de login solo es necesaria la primera vez que se conecta el usuario.
- [x] La pantalla de login ahora pide:
  - usuario: ya no necesita ser una dirección de email válida
  - alias: obligatorio y no puede quedar en blanco
  - contraseña: opcional
- [x] Si el usuario introducido ya tiene formato email, se sigue aceptando para mantener compatibilidad con cuentas existentes.
- [x] Si la contraseña se deja vacía, se mantiene el flujo de acceso automático actual.
- [x] Si la contraseña se informa:
  - si el usuario ya existe y la contraseña es correcta, inicia sesión con contraseña
  - si el usuario no existe, se crea con esa contraseña y entra directamente
  - si falla el acceso por contraseña, no se reasigna automáticamente ninguna contraseña
- [x] En la parte superior derecha se muestra el alias.
- [x] Los usuarios nuevos quedan como `lector` por defecto.

## Cambios en layout y navegación

- [x] El menú de la izquierda ya no es necesario y se ha eliminado del layout principal.
- [x] Se ha hecho una versión adaptada a pantallas verticales y móvil:
  - acciones del topbar en varias filas
  - filtros y cambio de vista adaptados a ancho pequeño
  - tabla de pilotos convertida en tarjetas en móvil
- [x] Los KPI se han compactado para dejar más espacio a la vista de pilotos.
- [x] Al pulsar en el alias:
  - si es administrador, se abre la pantalla de administración
  - si es editor o lector, se abre una ventana para cambiar el alias
  - se mantiene la opción de cerrar sesión en el menú desplegable