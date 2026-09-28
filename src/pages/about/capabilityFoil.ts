/// <reference types="@webgpu/types" />
import { effect, frame, init, surface, type Effect, type Gpu, type Surface } from 'vgpu';
import fragment from './capabilityFoil.wgsl?raw';

export interface FoilFrame {
  width: number;
  height: number;
  /** Pointer and entry coordinates are normalized to the card. */
  x: number;
  y: number;
  originX: number;
  originY: number;
  material: number;
  structure: number;
  texture: number;
  edge: number;
  edgeGlow: number;
  reflection: number;
  saturation: number;
  reflectionWidth: number;
  /** Degrees, matching the existing controls. */
  angle: number;
  edgeIntensity: number;
}

export interface FoilRenderer {
  /** Rejects when WebGPU initialization or shader compilation fails. */
  ready: Promise<void>;
  draw(value: FoilFrame): void;
  dispose(): void;
}

/**
 * On-demand adapter for the official vgpu effect/surface renderer architecture.
 * The capability card owns its finite animation loop; this adapter never starts one.
 * Startup failures reject ready. Failures after ready call onError and release WebGPU.
 */
export function createCapabilityFoil(
  canvas: HTMLCanvasElement,
  onError?: (error: unknown) => void,
): FoilRenderer {
  let disposed = false;
  let initialized = false;
  let readySettled = false;
  let startupError: unknown;
  let gpu: Gpu | undefined;
  let output: Surface | undefined;
  let shader: Effect | undefined;
  let latest: FoilFrame | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let removeErrors = () => {};
  let removeResolutionListener = () => {};

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    initialized = false;
    latest = undefined;
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    window.removeEventListener('resize', resize);
    removeResolutionListener();
    removeResolutionListener = () => {};
    removeErrors();
    removeErrors = () => {};
    const context = gpu;
    gpu = undefined;
    shader = undefined;
    output = undefined;
    // vgpu disposes the surface, pipelines, uniform buffers, then its owned device.
    context?.dispose();
  };

  const fail = (error: unknown) => {
    if (disposed) return;
    const wasReady = readySettled;
    if (!wasReady) startupError = error;
    dispose();
    if (wasReady) {
      // Keep user callbacks from creating unhandled rejections in device.lost.
      try {
        if (onError) onError(error);
        else console.error('Capability WebGPU renderer failed.', error);
      } catch (callbackError) {
        console.error(callbackError);
      }
    }
  };

  const render = () => {
    const context = gpu;
    const target = output;
    const material = shader;
    const value = latest;
    if (disposed || !initialized || !context || !target || !material || !value) return;
    if (value.width <= 0 || value.height <= 0) return;

    try {
      frame(context, currentFrame => {
        // surface's frame hook has applied CSS sizing/DPR before this callback.
        material.set({
          params: {
            resolution: target.size,
            size: [value.width, value.height],
            pointer: [value.x, value.y],
            origin: [value.originX, value.originY],
            material: value.material,
            structure: value.structure,
            texture: value.texture,
            edge: value.edge,
            edgeGlow: value.edgeGlow,
            reflection: value.reflection,
            saturation: value.saturation,
            reflectionWidth: value.reflectionWidth,
            angle: value.angle,
            edgeIntensity: value.edgeIntensity,
          },
        });
        currentFrame.pass(target, material);
      });
    } catch (error) {
      fail(error);
    }
  };

  // Resize also redraws a settled hover without keeping an idle animation loop alive.
  // Do not call frame from surface.onResize: vgpu prohibits that reentrancy.
  const resize = () => {
    if (disposed || !latest) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) return;
    latest = { ...latest, width, height };
    render();
  };

  // A monitor/zoom change can alter DPR without changing the card's CSS size.
  // Re-arm the query after each change so a settled card redraws at native density.
  const watchResolution = () => {
    removeResolutionListener();
    if (disposed) return;
    const query = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const change = () => {
      watchResolution();
      resize();
    };
    query.addEventListener('change', change);
    removeResolutionListener = () => query.removeEventListener('change', change);
  };

  const ready = (async () => {
    const context = await init({ label: 'product-design-foil' });
    if (disposed) {
      context.dispose();
      return;
    }
    gpu = context;

    const unsubscribe = context.onError(fail);
    const uncapturedError = (event: GPUUncapturedErrorEvent) => {
      event.preventDefault();
      fail(event.error);
    };
    context.gpu.addEventListener('uncapturederror', uncapturedError);
    removeErrors = () => {
      unsubscribe();
      context.gpu.removeEventListener('uncapturederror', uncapturedError);
    };
    void context.gpu.lost.then(info => {
      if (!disposed) fail(new Error(`Capability WebGPU device lost: ${info.message || info.reason}`));
    }, error => fail(error));

    output = surface(context, canvas, {
      label: 'product-design-foil-surface',
      // No DPR cap: vgpu tracks the actual screen/browser zoom on every draw.
      clearColor: [0, 0, 0, 0],
      alphaMode: 'premultiplied',
    });
    shader = effect(context, fragment, { label: 'product-design-foil-material' });
    await shader.compile({ colors: [output.format] });
    if (startupError !== undefined) throw startupError;
    if (disposed) return;

    initialized = true;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener('resize', resize, { passive: true });
    watchResolution();
    // draw() may have been called repeatedly during adapter/device compilation.
    // Present only the latest state, even if the card's rAF has already settled.
    render();
    if (startupError !== undefined) throw startupError;
    readySettled = true;
  })().catch((error: unknown) => {
    if (startupError !== undefined) throw startupError;
    // Unmount/reduced-motion cleanup can race asynchronous compilation.
    if (disposed) return;
    dispose();
    throw error;
  });

  return {
    ready,
    draw(value) {
      if (disposed) return;
      latest = { ...value };
      render();
    },
    dispose,
  };
}
