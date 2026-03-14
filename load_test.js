const http = require('https');
const args = process.argv.slice(2);
const limit = args[0] || 10;
const start = Date.now();
http.get('https://bishouy.com/api/trpc/articles.list?input=%7B%22json%22%3A%7B%22limit%22%3A' + limit + '%7D%7D', (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => console.log('API Time taken: ' + (Date.now() - start) + 'ms'));
});
