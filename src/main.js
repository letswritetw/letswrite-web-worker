const loader = document.getElementById('loader');
const worker = new Worker('dist/worker.js');

worker.addEventListener('error', e => {
  console.error(e.message);
  loader.classList.add('hidden');
});

worker.onmessage = e => {
  document.getElementById('result').value = DOMPurify.sanitize(JSON.stringify(e.data, null, 2));
  loader.classList.add('hidden');
}

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