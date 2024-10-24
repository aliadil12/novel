










const { spawn, exec } = require('child_process');
const path = require('path');

console.log('Starting the application...');

// تشغيل الباكند
const backend = spawn('node', ['server.js'], { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

// تشغيل الفرونت إند
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCommand, ['run', 'dev'], { 
  cwd: path.join(__dirname, 'frontend'), 
  stdio: 'inherit',
  shell: true 
});

// انتظر لبضع ثوانٍ قبل فتح المتصفح
setTimeout(() => {
  console.log('\nOpening browser windows...');
  if (process.platform === 'win32') {
    exec('start http://localhost:3000');
    exec('start http://localhost:5000/admin');
  } else {
    exec('open http://localhost:3000');
    exec('open http://localhost:5000/admin');
  }
}, 5000);

// إغلاق العمليات عند إنهاء البرنامج
process.on('SIGINT', () => {
  console.log('Shutting down...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});










