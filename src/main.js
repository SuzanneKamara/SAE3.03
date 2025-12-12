import "./global.css";
import { Router } from "./lib/router.js";

import { RootLayout } from "./layouts/root/layout.js";
import { The404Page } from "./pages/404/page.js";
import { SvgDemo1Page } from "./pages/svg-demo1/page.js";

// Exemple d'utilisation avec authentification

const router = new Router("app");

router.addLayout("/", RootLayout);


router.addRoute("/", SvgDemo1Page);
router.addRoute("/svg-demo1", SvgDemo1Page);


router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
