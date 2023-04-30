module.exports = (payload, sendToServer) => {
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  const response = {
    event: 'storeProcessInfo',
    payload: {
      CPU: {
        user: cpuUsage.user / 1000000,
        system: cpuUsage.system / 1000000
      },
      memory: memoryUsage.toFixed(2)
    },
  };
  sendToServer(response);
};
