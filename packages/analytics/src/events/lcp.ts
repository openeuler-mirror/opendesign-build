import { OpenEventKeys } from './_keys';
import { onLCP } from 'web-vitals';

export default {
  event: OpenEventKeys.LCP,
  collector: () => {
    return new Promise((resolve) => {
      onLCP((m) => {
        resolve({
          url: window.location.href,
          lcp: m.value,
        });
      });
    });
  },
};
