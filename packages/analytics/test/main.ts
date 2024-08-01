import { OpenAnalytics, OpenEventKeys } from '../src/index';

const btn1 = document.querySelector('#btn1');
const btnOpen = document.querySelector('#btn-open');
const btnClose = document.querySelector('#btn-close');

const oa = new OpenAnalytics({
  appKey: 'test',
  request: (data) => {
    console.log('request to send content', data);
    return fetch('report', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((response) => response.ok);
  },
  // immediate: true,
});
oa.setHeader({
  appCode: '123',
});
function enabledOA(enabled) {
  oa.enableReporting(enabled);
  localStorage.setItem('enabled', enabled ? '1' : '0');
}
if (localStorage.getItem('enabled') !== '1') {
  enabledOA(false);
}

oa.report(OpenEventKeys.PV, () => ({
  id: 'home',
}));
oa.report(OpenEventKeys.PageBasePerformance);
oa.report(OpenEventKeys.LCP);
oa.report(OpenEventKeys.INP);

btn1?.addEventListener('click', () => {
  // window.open('/');
  console.log('btn1 clicked');

  oa.report('btn-click', {
    date: Date.now(),
  });
});

btnOpen?.addEventListener('click', () => {
  enabledOA(true);
});
btnClose?.addEventListener('click', () => {
  enabledOA(false);
});
