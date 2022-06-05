import Button from "../makiClasses/Button";

export default class CircleButton extends Button {
  //

  getElTag(): string {
    return "button";
  }

  draw(): void {
    super.draw()
    this.getDiv().classList.add('circle') //TODO: remove temporary
  }
}
