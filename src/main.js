// https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api
// https://www.w3schools.com/html/html5_webworkers.asp
// https://www.ruanyifeng.com/blog/2018/07/web-worker.html

const loader = document.getElementById('loader');
const worker = new Worker('dist/worker.js');

worker.addEventListener('error', e => {
  console.error(e.message);
  loader.classList.add('hidden');
});

worker.addEventListener('message', e => {
  document.getElementById('result').value = DOMPurify.sanitize(JSON.stringify(e.data, null, 2));
  loader.classList.add('hidden');
});

const btn = document.getElementById('send');

btn.addEventListener('click', () => {
  // 只在需要時向Worker發送消息
  loader.classList.remove('hidden');
  const config = {
    title: DOMPurify.sanitize(document.getElementById('title').value),
    content: DOMPurify.sanitize(document.getElementById('content').value),
    userId: Math.floor(Math.random() * 10) + 1,
  };
  worker.postMessage({ type: 'axios', uri: 'https://jsonplaceholder.typicode.com/posts', config });
});

// 頁面卸載時清理Worker
window.addEventListener('beforeunload', () => {
  if (worker) {
    worker.terminate();
  }
});