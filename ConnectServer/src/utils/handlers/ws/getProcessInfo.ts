import { cpuUsage, memoryUsage } from 'node:process';
export = (_: never, sendToServer: (response: object) => void) => {
  const memoryUsageNum: number = memoryUsage().heapUsed / 1024 / 1024;

  const response = {
    event: 'setProcessInfoFromServer',
    payload: {
      CPU: {
        user: (cpuUsage().user / 1000000).toFixed(2),
        system: (cpuUsage().system / 1000000).toFixed(2),
      },
      memory: memoryUsageNum.toFixed(2),
    },
  };

  sendToServer(response);
};
