if (typeof globalThis.MessageChannel === 'undefined') {
  try {
    const { MessageChannel } = require('worker_threads');
    globalThis.MessageChannel = MessageChannel;
  } catch {}
}
