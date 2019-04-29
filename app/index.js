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

const fullscreenMode = args.includes('f');
const loadOnline = args.includes('o');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800, height: 600,
    fullscreen: fullscreenMode, frame: !fullscreenMode, resizable: !fullscreenMode,
    // transparent: fullscreenMode,
    thick: fullscreenMode,
    skipTaskbar: fullscreenMode,
    // alwaysOnTop: true
  })
  const id = windowId++;
  windows[id] = win;
  lastWindow = win;

  // win.hide();
  // win.isHidden = true;

  win.setAutoHideMenuBar(true);

  // and load the index.html of the app.
  if (loadOnline) {
    win.loadURL('https://lideming.github.io/toolbox/randomseat.html');
  } else {
    win.loadFile('randomseat.html');
  }

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object
    delete windows[id];
    if (lastWindow === win) {
      lastWindow = null;
    }
  })
}

var toggleHidden = (force) => {
  let win = lastWindow;
  if (!win) return;
  if (fullscreenMode) {
    if (force === undefined) force = !win.isHidden;
    if (force) {
      win.minimize(); // workaround to release focus
      win.hide();
      win.isHidden = true;
    } else {
      // The window is not fullscreen after minimize()
      win.setFullScreen(true);
      win.show();
      win.isHidden = false;
    }
  } else {
    if (force === undefined) force = !win.isMinimized();
    if (force) {
      win.minimize();
    } else {
      win.restore();
    }
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  // dialog.showMessageBox({type: 'info', title: 'Application started' , message: 'Click on OK to dismiss this hint,\nthen press the shortcut (Ctrl + L) to show/hide the main window.'});
  globalShortcut.register('Ctrl+L', () => toggleHidden());
  if (args.includes('h')) toggleHidden(true);
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
