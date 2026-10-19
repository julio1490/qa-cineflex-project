const { Builder, By, until } = require("selenium-webdriver");
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");

const LoginPage = require("./pages/LoginPage");
const CarteleraPage = require("./pages/CarteleraPage");
const ReservaPage = require("./pages/ReservaPage");

const URL = "http://127.0.0.1:5500/frontend/";
const CORREO = "qa@cineflex.test";
const CLAVE = "Cineflex2026!";

let driver;
let login;
let cartelera;
let reserva;

beforeEach(async () => {
  driver = await new Builder().forBrowser("chrome").build();
  login = new LoginPage(driver);
  cartelera = new CarteleraPage(driver);
  reserva = new ReservaPage(driver);
  await driver.get(URL);
});

afterEach(async () => {
  if (driver) {
    await driver.quit();
  }
});

async function iniciarSesion() {
  await login.ingresarCredenciales(CORREO, CLAVE);
  await login.iniciarSesion();
  await cartelera.esperarCartelera();
}

async function iniciarCompra() {
  await iniciarSesion();
  await cartelera.comprarPelicula("Viaje estelar");
}

test("01 - Rechaza una contraseña incorrecta", async () => {
  await login.ingresarCredenciales(CORREO, "Incorrecta");
  await login.iniciarSesion();
  assert.match(await login.obtenerMensaje(), /Credenciales incorrectas/);
});

test("02 - Informa los intentos restantes", async () => {
  await login.ingresarCredenciales("mal@cineflex.test", "Incorrecta");
  await login.iniciarSesion();
  assert.match(await login.obtenerMensaje(), /Intentos restantes: 2/);
});

test("03 - Bloquea el acceso después de tres intentos fallidos", async () => {
  for (let intento = 0; intento < 3; intento++) {
    await login.ingresarCredenciales("mal@cineflex.test", "Incorrecta");
    await login.iniciarSesion();
  }
  assert.match(await login.obtenerMensaje(), /Acceso bloqueado/);
});

test("04 - Permite iniciar sesión con las credenciales de prueba", async () => {
  await iniciarSesion();
  assert.equal(await cartelera.carteleraVisible(), true);
});

test("05 - Muestra el correo del usuario conectado", async () => {
  await iniciarSesion();
  assert.equal(await cartelera.obtenerUsuario(), CORREO);
});

test("06 - Muestra el título Cartelera", async () => {
  await iniciarSesion();
  assert.equal(await cartelera.obtenerTitulo(), "Cartelera");
});

test("07 - Presenta tres películas", async () => {
  await iniciarSesion();
  assert.equal(await cartelera.cantidadPeliculas(), 3);
});

test("08 - Comprar abre la selección de asientos", async () => {
  await iniciarCompra();
  assert.equal(
    await driver.findElement(By.id("seats-view")).isDisplayed(),
    true
  );
});

test("09 - Continuar está deshabilitado sin elegir asiento", async () => {
  await iniciarCompra();
  assert.equal(await reserva.continuarHabilitado(), false);
});

test("10 - Permite seleccionar el asiento A1", async () => {
  await iniciarCompra();
  await reserva.seleccionarAsiento("A1");
  assert.equal(await reserva.asientoSeleccionado("A1"), true);
});

test("11 - Habilita Continuar al seleccionar un asiento", async () => {
  await iniciarCompra();
  await reserva.seleccionarAsiento("A1");
  assert.equal(await reserva.continuarHabilitado(), true);
});

test("12 - Muestra la película y el asiento en el pago", async () => {
  await iniciarCompra();
  await reserva.seleccionarAsiento("A1");
  await reserva.continuarAlPago();
  assert.match(await reserva.obtenerResumen(), /Viaje estelar.*A1/);
});

test("13 - Genera un ticket tras confirmar el pago de prueba", async () => {
  await iniciarCompra();
  await reserva.seleccionarAsiento("A1");
  await reserva.continuarAlPago();
  await reserva.ingresarPago("Usuario de prueba", "4242424242424242");
  await reserva.confirmarCompra();

  await driver.wait(
    until.elementLocated(By.id("ticket-code")), 5000
  );

  assert.match(await reserva.obtenerTextoTicket(), /Compra aprobada/);
});

test("14 - Cerrar sesión vuelve al inicio", async () => {
  await iniciarSesion();
  await cartelera.cerrarSesion();
  assert.equal(await login.vistaLoginVisible(), true);
});

test("15 - El botón Atrás no muestra la cartelera después de cerrar sesión", async () => {
  await iniciarSesion();
  await cartelera.cerrarSesion();
  await driver.navigate().back();

  await driver.wait(
    until.elementIsVisible(driver.findElement(By.id("login-view"))),
    5000
  );

  assert.equal(await login.vistaLoginVisible(), true);
});
