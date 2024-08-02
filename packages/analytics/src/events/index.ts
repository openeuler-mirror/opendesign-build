import { OpenEventKeys } from './keys';
import { EventContent } from '../types';

import { isFunction } from '../utils';

export interface CollectorOptions {
  customData?: () => Promise<EventContent> | EventContent;
}

type EventCollector = (options?: CollectorOptions) => Promise<EventContent> | EventContent;

interface Event {
  event: string;
  collector: EventCollector;
}

const modules: Record<string, Record<string, Event>> = import.meta.glob(['./*.ts', '!./keys.ts'], {
  eager: true,
});

const Events = new Map<string, EventCollector>();

for (const path in modules) {
  const m = modules[path].default;
  if (m) {
    Events.set(m.event, m.collector);
  }
}

export { OpenEventKeys, Events };

export function isInnerEvent(event: string) {
  return Events.has(event);
}

export function getInnerEventData(event: string, collectorOption?: CollectorOptions) {
  const colloctor = Events.get(event);
  if (isFunction(colloctor)) {
    return colloctor(collectorOption);
  }
}
