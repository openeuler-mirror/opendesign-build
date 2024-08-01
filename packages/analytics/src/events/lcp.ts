import { OpenEventKeys } from './keys';
import { onLCP } from 'web-vitals';

export default {
  event: OpenEventKeys.LCP,
  collector: () => {
    return new Promise((resolve) => {
      onLCP((m) => {
        resolve({
          lcp: m.value,
        });
      });
    });
  },
};
