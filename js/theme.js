/* theme.js — ToolHub 5D appearance and palette system */
'use strict';

(function () {
  var STORAGE_KEY = 'th_appearance';
  var palettes = [
    { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#6366f1', accent: '#06b6d4' },
    { id: 'green', name: 'Green', primary: '#10b981', secondary: '#059669', accent: '#84cc16' },
    { id: 'purple', name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#c084fc' },
    { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#ea580c', accent: '#f59e0b' },
    { id: 'red', name: 'Red', primary: '#ef4444', secondary: '#dc2626', accent: '#fb7185' },
    { id: 'pink', name: 'Pink', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    { id: 'teal', name: 'Teal', primary: '#14b8a6', secondary: '#0f766e', accent: '#2dd4bf' },
    { id: 'indigo', name: 'Indigo', primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    { id: 'yellow', name: 'Yellow', primary: '#eab308', secondary: '#ca8a04', accent: '#facc15' },
    { id: 'cyan', name: 'Cyan', primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
    { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#047857', accent: '#34d399' },
    { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185' },
    { id: 'sunset', name: 'Sunset', primary: '#f97316', secondary: '#db2777', accent: '#facc15' },
    { id: 'ocean', name: 'Ocean', primary: '#0ea5e9', secondary: '#2563eb', accent: '#22d3ee' },
    { id: 'midnight', name: 'Midnight', primary: '#818cf8', secondary: '#312e81', accent: '#38bdf8' },
    { id: 'royal', name: 'Royal', primary: '#7c3aed', secondary: '#1d4ed8', accent: '#a78bfa' }
  ];

  var gradients = [
    { id: 'aurora', name: 'Aurora', value: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent), var(--theme-secondary))' },
    { id: 'linear', name: 'Linear', value: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))' },
    { id: 'soft', name: 'Soft glow', value: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-secondary) 12%, transparent))' },
    { id: 'solid', name: 'Solid', value: 'var(--theme-primary)' }
  ];

  function readState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        palette: palettes.some(function (item) { return item.id === saved.palette; }) ? saved.palette : 'blue',
        mode: ['light', 'dark', 'system'].includes(saved.mode) ? saved.mode : 'dark',
        custom: saved.custom && typeof saved.custom === 'object' ? saved.custom : null
      };
    } catch (error) {
      return { palette: 'blue', mode: 'dark', custom: null };
    }
  }

  function systemMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function hexToRgb(hex) {
    var value = String(hex || '').replace('#', '');
    if (value.length === 3) value = value.split('').map(function (char) { return char + char; }).join('');
    var number = parseInt(value, 16);
    if (Number.isNaN(number)) return { r: 99, g: 102, b: 241 };
    return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
  }

  function rgba(hex, alpha) {
    var rgb = hexToRgb(hex);
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ThemeSystem.state));
  }

  function apply() {
    var state = ThemeSystem.state;
    var palette = state.custom || palettes.find(function (item) { return item.id === state.palette; }) || palettes[0];
    var mode = state.mode === 'system' ? systemMode() : state.mode;
    var root = document.documentElement;
    var dark = mode === 'dark';
    var primary = palette.primary;
    var secondary = palette.secondary;
    var accent = palette.accent;
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-theme-palette', state.custom ? 'custom' : state.palette);
    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-secondary', secondary);
    root.style.setProperty('--theme-accent', accent);
    root.style.setProperty('--theme-gradient', state.custom && state.custom.gradientValue ? state.custom.gradientValue : 'linear-gradient(135deg, ' + primary + ', ' + secondary + ')');
    root.style.setProperty('--indigo', primary);
    root.style.setProperty('--purple', secondary);
    root.style.setProperty('--cyan', accent);
    root.style.setProperty('--blue', primary);
    root.style.setProperty('--green', primary);
    root.style.setProperty('--pink', accent);
    root.style.setProperty('--orange', primary);
    root.style.setProperty('--red', primary);
    root.style.setProperty('--border-h', rgba(primary, dark ? 0.38 : 0.28));
    root.style.setProperty('--border-glow', rgba(accent, dark ? 0.34 : 0.28));
    root.style.setProperty('--glass2', rgba(primary, dark ? 0.08 : 0.045));
    root.style.setProperty('--grad-main', 'linear-gradient(135deg, ' + primary + ' 0%, ' + accent + ' 48%, ' + secondary + ' 100%)');
    root.style.setProperty('--grad-card', 'linear-gradient(135deg, ' + rgba(primary, dark ? 0.14 : 0.08) + ' 0%, ' + rgba(secondary, dark ? 0.08 : 0.04) + ' 100%)');
    root.style.setProperty('--sh-glow-indigo', '0 4px 18px ' + rgba(primary, dark ? 0.28 : 0.16));
    root.style.setProperty('--sh-glow-cyan', '0 4px 18px ' + rgba(accent, dark ? 0.24 : 0.14));
    root.style.setProperty('--theme-meta-color', dark ? '#0a0f18' : '#f8fafc');
    if (state.custom) {
      root.style.setProperty('--bg', state.custom.background || (dark ? '#0a0f18' : '#f5f7fb'));
      root.style.setProperty('--bg2', state.custom.surface || (dark ? '#111827' : '#ffffff'));
      root.style.setProperty('--bg3', rgba(state.custom.surface || '#111827', dark ? 0.84 : 0.72));
      root.style.setProperty('--card', rgba(state.custom.surface || '#111827', dark ? 0.9 : 0.96));
      root.style.setProperty('--card-hover', state.custom.surface || '#ffffff');
    } else {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--bg2');
      root.style.removeProperty('--bg3');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-hover');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0a0f18' : '#f5f7fb');
    if (typeof window.updateThemePanel === 'function') window.updateThemePanel();
  }

  var ThemeSystem = {
    palettes: palettes,
    gradients: gradients,
    state: readState(),
    getMode: function () { return this.state.mode === 'system' ? systemMode() : this.state.mode; },
    setPalette: function (id) {
      if (!palettes.some(function (item) { return item.id === id; })) return;
      this.state.palette = id;
      this.state.custom = null;
      save();
      apply();
    },
    setMode: function (mode) {
      if (!['light', 'dark', 'system'].includes(mode)) return;
      this.state.mode = mode;
      save();
      apply();
    },
    setCustom: function (custom) {
      this.state.custom = custom;
      save();
      apply();
    },
    reset: function () {
      this.state = { palette: 'blue', mode: 'dark', custom: null };
      save();
      apply();
    },
    apply: apply
  };
  window.ThemeSystem = ThemeSystem;
  apply();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (ThemeSystem.state.mode === 'system') apply();
    });
  }
})();
