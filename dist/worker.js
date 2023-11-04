// 引用 axios
importScripts('../dist/axios.min.js');

// 設定最大並行請求數限制
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;
let queue = [];

self.onmessage = e => {

  const d = e.data;

  if (d.type === 'axios') {
    // 保持 enqueueRequest 接收一個函數作為參數
    enqueueRequest(() => axios.post(d.uri, d.config));
  }

};

function enqueueRequest(requestFunction) {
  queue.push(requestFunction); // 把請求函數加入到隊列中
  processQueue(); // 處理隊列中的請求
}

function processQueue() {
  // 如果目前進行的請求數量沒有達到上限，而且隊列中還有請求等著處理
  while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length) {

    const nextRequest = queue.shift(); // 從隊列中取出下一個請求
    activeRequests++; // 增加正在處理的請求數量

    // 執行請求並處理結果
    nextRequest()
      .then(response => {
        self.postMessage(response.data); // 發送 response 到主執行緒
      })
      .catch(error => {
        // 發送請求失敗的 error 到主執行緒
        self.postMessage({ error: error.message, code: error.code });
      })
      .finally(() => {
        activeRequests--; // 不論成功或失敗，都要減少 active 的請求量
        processQueue(); // 並且繼續處理隊列中的下一個請求
      });

  }
}