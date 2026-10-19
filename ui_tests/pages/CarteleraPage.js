const { By, until } = require("selenium-webdriver");

class CarteleraPage {
  constructor(driver) {
    this.driver = driver;
    this.cartelera = By.id("cartelera-view");
    this.movies = By.css(".movie-card");
    this.userName = By.id("user-name");
    this.logoutButton = By.id("logout-button");
  }

  async esperarCartelera() {
    await this.driver.wait(
      until.elementLocated(By.css("#cartelera-view h1")), 5000
    );
  }

  async carteleraVisible() {
    return await this.driver.findElement(this.cartelera).isDisplayed();
  }

  async obtenerTitulo() {
    return await this.driver.findElement(
      By.css("#cartelera-view h1")
    ).getText();
  }

  async cantidadPeliculas() {
    return (await this.driver.findElements(this.movies)).length;
  }

  async obtenerUsuario() {
    return await this.driver.findElement(this.userName).getText();
  }

  async comprarPelicula(nombre) {
    const boton = By.css(`.buy-button[data-movie="${nombre}"]`);
    await this.driver.findElement(boton).click();
  }

  async cerrarSesion() {
    await this.driver.findElement(this.logoutButton).click();
  }
}

module.exports = CarteleraPage;
