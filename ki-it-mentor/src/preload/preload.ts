// Exposes a narrow, typed API to the sandboxed renderer. No Node APIs leak through.

import { contextBridge, ipcRenderer } from 'electron';
import type { MentorApi } from '../shared/ipc';

const api: MentorApi = {
  getState: () => ipcRenderer.invoke('state:get'),
  saveState: (state) => ipcRenderer.invoke('state:save', state),
  wipeAll: () => ipcRenderer.invoke('state:wipe'),
  listProviders: () => ipcRenderer.invoke('providers:list'),
  preview: (providerId, request) => ipcRenderer.invoke('explain:preview', providerId, request),
  run: (runId, providerId, request) => ipcRenderer.invoke('explain:run', runId, providerId, request),
  cancel: (runId) => ipcRenderer.invoke('explain:cancel', runId),
  openFile: () => ipcRenderer.invoke('file:open'),
  exportNotes: (format) => ipcRenderer.invoke('notes:export', format),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('window:alwaysOnTop', value),
  nudgeWindow: (dx, dy) => ipcRenderer.invoke('window:nudge', dx, dy),
  nextDisplay: () => ipcRenderer.invoke('window:nextDisplay'),
  hideWindow: () => ipcRenderer.invoke('window:hide'),
  listInbox: () => ipcRenderer.invoke('inbox:list'),
  clearInbox: () => ipcRenderer.invoke('inbox:clear'),
  onInboxChanged: (listener) => {
    const wrapped = () => listener();
    ipcRenderer.on('inbox:changed', wrapped);
    return () => ipcRenderer.removeListener('inbox:changed', wrapped);
  },
  appInfo: () => ipcRenderer.invoke('app:info'),
};

contextBridge.exposeInMainWorld('mentor', api);
