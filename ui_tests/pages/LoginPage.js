const { By, until } = require("selenium-webdriver");

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.email = By.id("email");
    this.password = By.id("password");
    this.loginButton = By.id("login-button");
    this.loginMessage = By.id("login-message");
  }

  async ingresarCredenciales(email, password) {
    const campoEmail = await this.driver.wait(
      until.elementLocated(this.email), 5000
    );
    await campoEmail.clear();
    await campoEmail.sendKeys(email);

    const campoPassword = await this.driver.findElement(this.password);
    await campoPassword.clear();
    await campoPassword.sendKeys(password);
  }

  async iniciarSesion() {
    await this.driver.findElement(this.loginButton).click();
  }

  async obtenerMensaje() {
    return await this.driver.findElement(this.loginMessage).getText();
  }

  async vistaLoginVisible() {
    return await this.driver.findElement(By.id("login-view")).isDisplayed();
  }
}

module.exports = LoginPage;
