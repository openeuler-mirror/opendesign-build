import { UAParser } from 'ua-parser-js';
/**
 * 生成随机字符串
 * @param prefix 前缀
 * @param length 字符串长度
 */
export function uniqueId(prefix: string = '', length: number = 8, Separator: string = '-'): string {
  const gen = (len: number): string => {
    if (len <= 11) {
      return Math.random()
        .toString(36)
        .slice(2, 2 + len)
        .padEnd(len, '0');
    } else {
      return gen(11) + gen(len - 11);
    }
  };
  return prefix ? `${prefix}${Separator}${gen(length)}` : gen(length);
}
/**
 * 判断是否是函数
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

// 是否是对象或者数组等（key:value 形式）
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}
/**
 * 判断是否是promise
 * @param val
 * @returns
 */
export const isPromise = <T>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
/**
 * 根据userAgent信息获取系统及浏览器信息
 */
export function getClientByUA(userAgent: string = window.navigator.userAgent) {
  const { browser, os, device } = UAParser(userAgent);
  return { browser, os, device };
}
/**
 * 在文档准备完成
 * @param callback
 */
export function whenDocumentReady(callback: () => any): void {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', () => callback());
  }
}

/**
 * 在文档准备完成
 * @param callback
 */
export function whenWindowLoad(callback: () => any): void {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => callback());
  } else {
    callback();
  }
}
