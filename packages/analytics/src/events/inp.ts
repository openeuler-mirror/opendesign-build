import { OpenEventKeys } from './_keys';
import { onINP } from 'web-vitals';

export default {
  event: OpenEventKeys.INP,
  collector: () => {
    return new Promise((resolve) => {
      onINP((m) => {
        resolve({
          $url: window.location.href,
          $inp: m.value,
        });
      });
    });
  },
};
