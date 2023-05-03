import styles from '@/styles/Main.module.css';
import {Console} from 'console-feed';
import {useEffect, useRef, useState} from 'react';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useRouter} from 'next/router';

const ServerLogsPage = () => {
  const router = useRouter();
  const {slug} = router.query;
  const {emitter} = useWebSocket();
  const [logs, setLogs] = useState([]);
  const ref = useRef();
  useEffect(() => {
    const handleLogs = payload => {
      const {data, serverName, type} = payload;
      if (serverName === slug) {
        const logMessage = data.replace(`${type.toUpperCase()}:`, '');
        const log = {
          method: type,
          data: [logMessage]
        };
        setLogs((currLogs) => {
          return [...currLogs, log];
        });
      }
    };

    emitter.on('logFromChildProcess', handleLogs);

    return () => {
      emitter.off('logFromChildProcess', handleLogs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitter]);

  useEffect(() => {
    ref.current?.lastElementChild?.scrollIntoView({behavior: 'smooth', block: 'end'});
  }, [logs]);

  const displayLoading = () => {
    if (logs.length) {
      return '';
    }
    return (
      <div className={styles.loader}>
        Waiting for new logs...
      </div>
    );
  };

  return (
    <div className={styles.boxWrapperFull}>
      <h1>{slug} logs</h1>
      <div className={styles.logsWrapper} ref={ref}>
        {displayLoading()}
        <Console logs={logs} variant="dark"/>
      </div>
    </div>
  );
};
export default ServerLogsPage;
