module.exports = (payload, sendToServer) => {
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  const response = {
    event: 'returnProcessInfoFromServer',
    payload: {
      CPU: {
        user: (cpuUsage.user / 1000000).toFixed(2),
        system: (cpuUsage.system / 1000000).toFixed(2)
      },
      memory: memoryUsage.toFixed(2)
    },
  };
  sendToServer(response);
};
