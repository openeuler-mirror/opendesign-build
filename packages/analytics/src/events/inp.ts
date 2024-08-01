import { OpenEventKeys } from './keys';
import { onINP } from 'web-vitals';

export default {
  event: OpenEventKeys.INP,
  collector: () => {
    return new Promise((resolve) => {
      onINP((m) => {
        resolve({
          inp: m.value,
        });
      });
    });
  },
};
