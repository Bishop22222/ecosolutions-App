import { handleLogin, handleRegister, handleLogout } from "./auth.js";
import { addPoints } from "./points.js";
import { navigate } from "./navigation.js";

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.addMockPoints = addPoints;
window.navigate = navigate;
