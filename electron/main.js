// Electron main process. Launches the Next.js "standalone" server as a child
// process using Electron's own bundled Node runtime (ELECTRON_RUN_AS_NODE) so
// the packaged app never depends on the user having Node.js installed, then
// opens a window pointing at it — a self-contained, offline desktop app.
const { app, BrowserWindow } = require("electron");
const { fork } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const PORT = process.env.HOUSE_PORT || "4173";
const HOST = "127.0.0.1";

let serverProcess = null;
let mainWindow = null;

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "standalone", "server.js");
  }
  return path.join(__dirname, "..", ".next", "standalone", "server.js");
}

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Server did not respond within ${timeoutMs}ms`));
          } else {
            setTimeout(attempt, 300);
          }
        });
    };
    attempt();
  });
}

function startServer() {
  const serverPath = getServerPath();
  serverProcess = fork(serverPath, [], {
    cwd: path.dirname(serverPath),
    env: {
      ...process.env,
      PORT,
      HOSTNAME: HOST,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  serverProcess.stdout?.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  serverProcess.stderr?.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));
  serverProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Standalone server exited with code ${code}`);
    }
  });
  return waitForServer(`http://${HOST}:${PORT}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    title: "HOUSE",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(`http://${HOST}:${PORT}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error("Failed to start the HOUSE server:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
}

app.on("before-quit", stopServer);
app.on("will-quit", stopServer);
