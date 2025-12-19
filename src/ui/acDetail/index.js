import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
class AcView {
  constructor() {
    this.root = htmlToDOM(template);
  }
  html() {
    return template;
  }

  dom() {
    return this.root;
  }
}
export { AcView };