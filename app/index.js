const { app, BrowserWindow, globalShortcut, dialog } = require('electron')


if (!app.requestSingleInstanceLock()) {
  app.quit();
  return; // Do we really need return?
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const windows = {};
let lastWindow = null;
let windowId = 0;
const args = process.argv.slice(2);

let winIndex = null;
let winSeat = null;
let namedWins = {};

const shared = global.shared = {};

const loadOnline = args.includes('o');

function createWindow(fullscreen, options) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800, height: 600,
    fullscreen: fullscreen, frame: !fullscreen, resizable: !fullscreen,
    // transparent: fullscreen,
    thick: fullscreen,
    skipTaskbar: fullscreen,
    webPreferences: { nodeIntegration: true },
    // alwaysOnTop: true,
    show: false,
    autoHideMenuBar: true,
    ...options // Oh... JavaScript is f**king awesome!
  });
  const id = windowId++;
  windows[id] = win;
  lastWindow = win;

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object
    delete windows[id];
    if (lastWindow === win) {
      lastWindow = null;
    }
  });
  return win;
}

function tryShow(win) {
  if (win && !win.isDestroyed()) {
    toggleHidden(win, false);
    return true;
  }
  return false;
}

function openIndex() {
  if (tryShow(winIndex)) return;
  const win = winIndex = createWindow(false, {
    width: 420, height: 310,
    maximizable: false,
    // closable: false,
  });
  win.loadFile('toolboxindex.html');
  win.show();
}

function openSeat(fullscreen) {
  if (tryShow(winSeat)) return;
  const win = winSeat = createWindow(fullscreen);
  if (loadOnline) {
    win.loadURL('https://lideming.github.io/toolbox/randomseat.html');
  } else {
    win.loadFile('randomseat.html');
  }
  win.show();
}

function openNamedPage(file) {
  if (tryShow(namedWins[file])) return;
  const win = namedWins[file] = createWindow(false);
  win.loadFile(file);
  win.show();
}

shared.openSeat = openSeat;
shared.openIndex = openIndex;
shared.openNamedPage = openNamedPage;
shared.quit = () => app.quit();

var toggleHidden = (win, force) => {
  if (!win) return;
  if (win.isFullScreen()) {
    if (force === undefined) force = !win.isHidden;
    if (force) {
      win.minimize(); // workaround to release focus
      win.hide();
      win.isHidden = true;
    } else {
      // The window is not fullscreen after minimize()
      win.setFullScreen(true);
      win.show();
      win.focus();
      win.isHidden = false;
    }
  } else {
    if (force === undefined) force = !win.isMinimized();
    if (force) {
      win.minimize();
    } else {
      win.restore();
      win.focus();
    }
  }
};


app.on('second-instance', (event, commandLine, workingDirectory) => {
  openIndex();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  openIndex();
  // dialog.showMessageBox({type: 'info', title: 'Application started' , message: 'Click on OK to dismiss this hint,\nthen press the shortcut (Ctrl + L) to show/hide the main window.'});
  // if (startHidden) toggleHidden(true);
  globalShortcut.register('Ctrl+L', () => {
    if (winSeat && !winSeat.isDestroyed()) {
      toggleHidden(winSeat);
    } else {
      openSeat(true);
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // // On macOS it's common to re-create a window in the app when the
  // // dock icon is clicked and there are no other windows open.
  // if (win === null) {
  //   createWindow()
  // }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
