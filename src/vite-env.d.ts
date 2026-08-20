/// <reference types="vite/client" />

declare module '*.gpx?raw' {
  const content: string;
  export default content;
}

declare const __APP_VERSION__: string;
