import { OpenEventKeys } from './keys';

import { isFunction } from '../utils';

type EventCollector = (...params: any[]) => Promise<Record<string, any>> | Record<string, any>;
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

export function getInnerEventData(event: string, params: any[] = []) {
  const colloctor = Events.get(event);
  if (isFunction(colloctor)) {
    return colloctor(...params);
  }
}
