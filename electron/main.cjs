/**
 * Fluentia — shell de aplicação para Windows, macOS e Linux.
 * Corre com: ELECTRON_START_URL=http://localhost:3000 npx electron electron/main.cjs
 */
const { app, BrowserWindow, shell, session, Menu } = require("electron");

const APP_URL = process.env.ELECTRON_START_URL || "https://SUBSTITUI-PELO-TEU-DOMINIO";
const isDev = Boolean(process.env.ELECTRON_START_URL);

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 420,
    minHeight: 620,
    backgroundColor: "#103E33",
    title: "Fluentia",
    autoHideMenuBar: true,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    icon: require("path").join(__dirname, "..", "public", "icons", "icon-512.png"),
    webPreferences: {
      preload: require("path").join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadURL(APP_URL);

  if (isDev) win.webContents.openDevTools({ mode: "detach" });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  // Microfone necessário para o ditado e para os desafios de pronúncia.
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ["media", "microphone", "audioCapture", "clipboard-read", "clipboard-write"];
    callback(allowed.includes(permission));
  });

  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
