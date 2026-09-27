/**
 * A transformed ancestor makes position:fixed relative to itself. Before zooming
 * the page, preserve viewport-fixed descendants at their current visual positions
 * in that new coordinate system. Release synchronously when the transform ends.
 * The original nodes stay mounted, including live canvases and the project scroller.
 */
export function pinViewportLayers(stage: HTMLElement): () => void {
  const stageBox = stage.getBoundingClientRect();
  const properties = ['top', 'left', 'right', 'bottom', 'width', 'height', 'box-sizing'] as const;
  const layers = [...stage.querySelectorAll<HTMLElement>('*')].filter(element => {
    if (getComputedStyle(element).position !== 'fixed') return false;
    // A fixed node already contained by a transform should keep its own layout.
    for (let parent = element.parentElement; parent && parent !== stage; parent = parent.parentElement) {
      const css = getComputedStyle(parent);
      if (css.transform !== 'none' || css.perspective !== 'none' || css.filter !== 'none' ||
          /transform|perspective|filter/.test(css.willChange) || /paint|layout|strict|content/.test(css.contain)) return false;
    }
    return true;
  }).map(element => ({
    element,
    box: element.getBoundingClientRect(),
    saved: properties.map(property => [property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)] as const),
  }));
  for (const { element, box } of layers) {
    const style = element.style;
    style.setProperty('top', `${box.top - stageBox.top - stage.clientTop}px`);
    style.setProperty('left', `${box.left - stageBox.left - stage.clientLeft}px`);
    style.setProperty('right', 'auto');
    style.setProperty('bottom', 'auto');
    style.setProperty('width', `${box.width}px`);
    style.setProperty('height', `${box.height}px`);
    style.setProperty('box-sizing', 'border-box');
  }
  return () => {
    for (const { element, saved } of layers) {
      for (const [property, value, priority] of saved) {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      }
    }
  };
}
