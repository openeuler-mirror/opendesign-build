export type EventContent = {
  [k: string | number]: string | number | EventContent | undefined | null;
};

export interface EventData {
  event: string; // 事件名
  time: number; // 事件采集时间
  data: EventContent; // 上报的事件数据
  sId: string; // 会话id
}

export interface EventHeader {
  cId?: string; // 客户端匿名标识，清除浏览器缓存销毁
  aId?: string; // 应用id
  oa_version?: string; // OA版本
  screen_width?: number; // 屏幕宽度
  screen_height?: number; // 屏幕高度
  viewport_width?: number; // 视口宽度
  viewport_height?: number; // 视口高度
  os?: string; // 客户端操作系统
  os_version?: string; // 客户端操作系统版本
  browser?: string; // 客户端浏览器
  browser_version?: string; // 客户端浏览器版本
  device?: string; // 设备信息
  device_type?: string; // 设备类型
  device_vendor?: string; // 设备品牌
}

export interface ReportData {
  header: EventHeader;
  body: EventData[];
}

export type ReportRequest = (data: ReportData) => Promise<boolean> | void;

export interface OpenAnalyticsParams {
  request: (data: ReportData) => Promise<boolean> | void; // 上报数据的接口
  appKey?: string; // 采集app的key，用于区分多app上报
  immediate?: boolean; // 全局设置是否立即上报
  requestInterval?: number; //上报间隔
  maxEvents?: number;
  requestPlan?: (requestFn: () => void) => void;
}
