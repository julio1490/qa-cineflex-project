# ESTRATEGIA DE PRUEBAS DE SOFTWARE

## Proyecto: CineFlex

**Taller Práctico Integrador: QA en Producción**

**Fase A: Arquitectura y Estrategia de Pruebas**

### Objetivo

Diseñar una estrategia de aseguramiento de calidad para CineFlex. En este documento definiremos cómo integrar y probar sus componentes, qué requisitos debe cumplir el sistema y cómo comprobar que los cambios no dañen funciones existentes.

## 1. Estrategia de integración

### Enfoque seleccionado: Top-Down

Para CineFlex se propone integrar el sistema de arriba hacia abajo (Top-Down). Primero se comprueban los componentes más cercanos al usuario, como la interfaz y las rutas principales. Después se conectan los servicios internos, la base de datos y el módulo de pagos.

Mientras un componente interno todavía no esté disponible, se puede usar un componente simulado para continuar las pruebas.

### Uso de un Stub para pagos

El módulo de pagos se representará inicialmente con un **Stub**: un componente temporal que imita las respuestas de un servicio de pagos. No procesa dinero ni se conecta con un banco real.

El Stub recibirá el monto y el identificador de la reserva, y podrá devolver estos resultados:

- **Pago aprobado:** la reserva queda confirmada y se genera un ticket de prueba.
- **Pago rechazado:** la reserva no queda confirmada y se informa el motivo.
- **Error del servicio:** CineFlex muestra un mensaje y no marca la reserva como pagada.

Así podremos probar los distintos resultados de una reserva sin utilizar datos bancarios reales. Cuando el módulo definitivo esté disponible, el Stub podrá sustituirse por la integración real.

### Comparación con Bottom-Up

En una integración **Bottom-Up**, se prueban primero los componentes internos, como la base de datos y los servicios, y después se conectan con las rutas y la interfaz.

Para este proyecto se elige Top-Down porque permite comprobar temprano los recorridos que realizará el usuario. El Stub ayuda a simular los componentes que todavía no están listos.

## 2. Requisitos del sistema

### Requisitos funcionales

Los requisitos funcionales describen las acciones que CineFlex debe permitir.

**RF-01. Inicio de sesión:** el sistema debe permitir que un usuario registrado inicie sesión con su correo y contraseña. Si los datos son incorrectos, debe mostrar un mensaje de error y no iniciar la sesión.

**RF-02. Reserva de entradas:** el sistema debe permitir que un usuario seleccione una película y una función, elija asientos disponibles y solicite la reserva. La reserva solo debe confirmarse cuando el Stub de pagos responda que el pago fue aprobado.

### Requisitos no funcionales

Los requisitos no funcionales describen cómo debe comportarse el sistema.

**RNF-01. Rendimiento:** la consulta de la cartelera debe responder en menos de 300 milisegundos en las condiciones de prueba definidas para el proyecto.

**RNF-02. Seguridad:** las contraseñas no deben mostrarse en las respuestas de la API. Las rutas que requieren autenticación deben rechazar solicitudes sin un token válido.

## 3. Estrategia de pruebas de regresión

Las pruebas de regresión se ejecutarán después de modificar o corregir una función. Su objetivo es comprobar que el cambio no haya dañado funciones que ya estaban funcionando.

En CineFlex se volverán a probar, como mínimo:

- El inicio de sesión correcto y el rechazo de credenciales incorrectas.
- La consulta de la cartelera y su tiempo de respuesta.
- La selección de asientos y la creación de reservas.
- Las respuestas de pago aprobado, pago rechazado y error del Stub.
- El acceso a las rutas protegidas con token válido, inválido o ausente.

Las pruebas automatizadas de Postman se usarán para verificar la API. Las pruebas de Selenium comprobarán los recorridos principales desde la interfaz. Cuando estas pruebas estén listas, se podrán repetir al modificar el proyecto y desde el flujo de GitHub Actions.

## 4. Comparación entre Selenium y Cypress

| Aspecto | Selenium WebDriver | Cypress |
|---|---|---|
| Navegadores | Permite automatizar varios navegadores mediante WebDriver. | Se enfoca principalmente en navegadores compatibles con su entorno de ejecución. |
| Lenguajes | Admite varios lenguajes, entre ellos JavaScript, Java y Python. | Se escribe principalmente en JavaScript o TypeScript. |
| Ejecución | Controla el navegador desde un proceso externo. | Se integra estrechamente con la aplicación y el navegador de prueba. |
| Ventaja para este taller | Permite practicar automatización con Page Object Model (POM), como solicita el proyecto. | Ofrece una experiencia integrada y herramientas visuales útiles para depurar. |

Para CineFlex se utilizará **Selenium WebDriver**, porque el taller solicita automatizar pruebas con Selenium y organizar el código usando el patrón Page Object Model. Cypress se incluye en la comparación como una alternativa para pruebas de interfaz.
