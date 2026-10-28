const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("fluentiaDesktop", {
  platform: process.platform,
  isDesktopApp: true,
  version: process.versions.electron,
});
