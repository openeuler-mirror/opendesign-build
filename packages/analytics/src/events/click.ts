import { EventContent } from '../types';
import { isFunction } from '../utils';
import { OpenEventKeys } from './keys';

async function handleClick(e: MouseEvent, customData?: (event: MouseEvent) => Promise<EventContent> | EventContent) {
  const { pageX, pageY } = e;
  const { scrollLeft, scrollTop } = document.scrollingElement || document.documentElement;

  const cData = isFunction(customData) ? await customData(e) : {};

  return {
    url: window.location.href,
    pageX,
    pageY,
    documentScrollLeft: scrollLeft,
    documentScrollTop: scrollTop,
    ...cData,
  };
}

export default {
  event: OpenEventKeys.PageClick,
  collector: (options?: { customData: (event: MouseEvent) => Promise<any>; delay: Millisecond }) => {
    const { customData, delay = 800 } = options || {};
    return new Promise((resolve) => {
      let debounceId = 0;
      window.addEventListener(
        'click',
        (e) => {
          clearTimeout(debounceId);
          debounceId = globalThis.setTimeout(async () => {
            const data = await handleClick(e, customData);
            console.log(data);

            resolve(data);
          }, delay);
        },
        {
          capture: true,
        }
      );
    });
  },
};
