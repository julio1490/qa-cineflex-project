const { By } = require("selenium-webdriver");

class ReservaPage {
  constructor(driver) {
    this.driver = driver;
  }

  async seleccionarAsiento(asiento) {
    const boton = By.css(`.seat[data-seat="${asiento}"]`);
    await this.driver.findElement(boton).click();
  }

  async asientoSeleccionado(asiento) {
    const boton = By.css(`.seat[data-seat="${asiento}"]`);
    const clase = await this.driver.findElement(boton).getAttribute("class");
    return clase.includes("selected");
  }

  async continuarHabilitado() {
    return await this.driver.findElement(
      By.id("continue-button")
    ).isEnabled();
  }

  async continuarAlPago() {
    await this.driver.findElement(By.id("continue-button")).click();
  }

  async obtenerResumen() {
    return await this.driver.findElement(
      By.id("purchase-summary")
    ).getText();
  }

  async ingresarPago(nombre, tarjeta) {
    await this.driver.findElement(By.id("card-name")).sendKeys(nombre);
    await this.driver.findElement(By.id("card-number")).sendKeys(tarjeta);
  }

  async confirmarCompra() {
    await this.driver.findElement(
      By.css("#payment-form button[type='submit']")
    ).click();
  }

  async obtenerTextoTicket() {
    return await this.driver.findElement(By.id("ticket-view")).getText();
  }
}

module.exports = ReservaPage;
