import { RuntimeLoader } from '@rive-app/react-canvas';

// Load the project's shared Rive runtime (public/<project>/runtime/) instead of the unpkg CDN.
RuntimeLoader.setWasmUrl(new URL('../runtime/rive.wasm', window.location.href).href);
