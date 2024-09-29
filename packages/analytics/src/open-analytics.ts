import { Storage } from './storage';
import { whenDocumentReady, isFunction, isPromise, uniqueId, isClient } from './utils';
import { Constant } from './constant';
import { getInnerEventData, isInnerEvent, CollectorOptions } from './events';
import packageJson from '../package.json';
import { EventContent, EventData, EventHeader, OpenAnalyticsParams, ReportRequest } from './types';

class AnalyticsStoreKey {
  appPrefix: string;
  client: string;
  session: string;
  enabled: string;
  events: string;
  constructor(appKey: string = '') {
    this.appPrefix = appKey ? `${appKey}-` : '';

    this.client = this.getKey('client');
    this.session = this.getKey('session');
    this.enabled = this.getKey('enabled');
    this.events = this.getKey('events');
  }
  getKey(key: string) {
    return `${Constant.OA_PREFIX}-${this.appPrefix}${key}`;
  }
}
type StoreKeyIns = InstanceType<typeof AnalyticsStoreKey>;
/**
 * 创建存储对象
 */
function createStorageTarget() {
  if (isClient) {
    return globalThis.localStorage;
  }
  const store: Record<string, string> = {};
  return {
    setItem(key: string, value: string) {
      store[key] = value;
    },
    getItem(key: string) {
      return store[key];
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
}

export class OpenAnalytics {
  #store: InstanceType<typeof Storage>;
  #timer: number | null;
  #firstReport: boolean;
  #request: ReportRequest;
  #eventData: EventData[];
  #immediate: boolean;
  #sessionId: string = '';
  #appKey: string = '';
  #header: EventHeader;
  #StoreKey: StoreKeyIns;
  // 自定义上报策略
  #requestPlan?: (requestFn: () => void) => void;
  // 上报间隔，默认3s
  #requestInterval: number;
  #maxEvents: number;

  enabled: boolean;
  /**
   * 构造函数
   * @param params {OpenAnalyticsParams}
   */
  constructor(params: OpenAnalyticsParams) {
    this.#store = new Storage(createStorageTarget());
    this.#request = params.request;
    this.#immediate = params.immediate ?? false;
    this.#appKey = params.appKey ?? '';
    this.#StoreKey = new AnalyticsStoreKey(params.appKey);
    this.#requestInterval = params.requestInterval ?? Constant.DEFAULT_REQUEST_INTERVAL;
    this.#timer = null;
    this.#maxEvents = params.maxEvents ?? Constant.MAX_EVENTS;

    this.#firstReport = true;

    this.#eventData = this.#store.getAlways(this.#StoreKey.events, {
      defaultValue: () => [],
    }).value;

    this.#header = {};

    this.enabled = false;
  }
  /**
   * 初始化通用数据
   * @param keys {string}
   * @param appId {string}
   */
  #initHeader(keys: StoreKeyIns, appId: string): EventHeader {
    const aKey = keys.client;
    const client = this.#store.getAlways(aKey, {
      defaultValue: () => ({
        id: uniqueId(),
      }),
      setOption: {
        expire: Date.now() + Constant.CLIENT_EXPIRE_TIME,
      },
      onValid: () => {
        this.#store.setExpire(aKey, Date.now() + Constant.CLIENT_EXPIRE_TIME);
      },
    }).value;

    return {
      cId: client.id,
      aId: appId,
      oa_version: packageJson.version,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_width: window.screen.width || window.innerWidth,
      screen_height: window.screen.height || window.innerHeight,
    };
  }
  /**
   * 获取会话id，每次获取，延长有效期
   * @param sKey session key
   */
  #getSessionId(sKey: string) {
    const session = this.#store.getAlways(sKey, {
      defaultValue: () => ({
        id: uniqueId(),
      }),
      setOption: {
        expire: Date.now() + Constant.SESSION_EXPIRE_TIME,
      },
      onValid: () => {
        this.#store.setExpire(sKey, Date.now() + Constant.SESSION_EXPIRE_TIME);
      },
    }).value;

    return session.id;
  }
  /**
   * 搜集数据
   */
  #collect(data: EventData, immediate?: boolean) {
    this.#eventData.push(data);

    // 如果事件数超过最大数量，丢弃之前的事件
    if (this.#eventData.length > this.#maxEvents) {
      this.#eventData.shift();
    }
    if (this.enabled) {
      this.#store.set(this.#StoreKey.events, this.#eventData);

      this.#runRequestPlan(immediate);
    }
  }

  /**
   * 执行上报策略
   * @param immediate
   */
  #runRequestPlan(immediate?: boolean) {
    if (immediate || this.#immediate) {
      this.#doSendEventData();
    } else if (this.#firstReport) {
      this.#firstReport = false;
      whenDocumentReady(() => this.#doSendEventData());
    } else {
      if (isFunction(this.#requestPlan)) {
        this.#requestPlan(this.#doSendEventData);
      } else {
        const run = () => {
          this.#timer = window.setTimeout(() => {
            this.#doSendEventData();
            run();
          }, this.#requestInterval);
        };
        if (!this.#timer) {
          run();
        }
      }
    }
  }
  /**
   * 发起数据上报
   */
  #doSendEventData() {
    if (!this.#request || !this.enabled || this.#eventData.length === 0) {
      return;
    }
    const reportData = {
      header: this.#header,
      body: this.#eventData,
    };
    const rlt = this.#request(reportData);
    if (isPromise(rlt)) {
      rlt.then((isSuccess) => {
        if (isSuccess) {
          this.#eventData = [];
          this.#store.set(this.#StoreKey.events, []);
        }
      });
    } else {
      this.#eventData = [];
      this.#store.set(this.#StoreKey.events, []);
    }
  }
  /**
   * 设置header
   */
  setHeader(header: Record<string, string | number>) {
    Object.assign(this.#header, header);
  }
  /**
   * 控制是否发送数据上报
   * @param enabled
   */
  enableReporting(enabled: boolean = true) {
    if (this.enabled !== enabled) {
      this.enabled = enabled;
    }

    if (this.enabled) {
      this.#store.set(this.#StoreKey.enabled, Constant.OA_ENABLED);
      this.#header = Object.assign(this.#initHeader(this.#StoreKey, this.#appKey), this.#header);
      // 初始化sessionId
      this.#sessionId = this.#getSessionId(this.#StoreKey.session);
      // 给内存中事件添加sessionId
      this.#eventData.forEach((event) => {
        if (event.sId === '') {
          event.sId = this.#sessionId;
        }
      });
      // 将数据存储到本地
      this.#store.set(this.#StoreKey.events, this.#eventData);
      // 执行上报策略
      this.#runRequestPlan();
    } else if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = 0;
      this.#eventData = [];
      this.#store.remove(this.#StoreKey.enabled);
      this.#store.remove(this.#StoreKey.events);
      this.#store.remove(this.#StoreKey.client);
      this.#store.remove(this.#StoreKey.session);
    }
  }
  /**
   * 采集数据
   * @param event 事件名
   * @param data 事件数据，如果是内部事件，则会在内部事件触发时执行
   * @param options 配置
   */
  async report(event: string, content?: (...opts: any[]) => Promise<EventContent> | EventContent, collectOptions?: CollectorOptions, immediate?: boolean) {
    if (!event) {
      return;
    }

    let reportData: EventContent = {};

    if (isInnerEvent(event)) {
      reportData = (await getInnerEventData(event, collectOptions)) || {};
    } else if (content) {
      reportData = await content();
    }

    const eventData: EventData = {
      event: event,
      time: Date.now(),
      properties: reportData,
      sId: this.enabled ? this.#getSessionId(this.#StoreKey.session) : '',
    };

    this.#collect(eventData, immediate);
  }
}
