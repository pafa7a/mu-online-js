import styles from '@/styles/Main.module.css';
import {Console} from 'console-feed';
import {useEffect, useRef, useState} from 'react';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useRouter} from 'next/router';
import axios from 'axios';
import {TbDotsVertical} from 'react-icons/tb';
import useOutsideClick from '@/hooks/useOutsideClick';

const ServerLogsPage = () => {
  const router = useRouter();
  const {slug} = router.query;
  const {emitter} = useWebSocket();
  const [logs, setLogs] = useState([]);
  const ref = useRef();
  const boxMenuRef = useRef();
  const [actionMenuActive, setActionMenuActive] = useState(false);
  useEffect(() => {
    const handleLogs = payload => {
      const {data, serverName, type} = payload;
      if (serverName === slug) {
        const logMessage = data.replace(`${type.toUpperCase()}:`, '');
        const log = {
          method: type,
          data: [`[${new Date().toISOString()}] ${logMessage.trim()}`]
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
    ref.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [logs]);

  const getStoredLogs = () => {
    axios.get(`/api/logs?app=${slug}`).then(res => {
      const {data} = res;
      const logs = [];
      data.forEach(log => {
        const source = log._source;
        logs.push({
          method: source.logType,
          data: [`[${source.date}] ${source.message.trim()}`]
        });
      });
      setLogs(logs);
    }).catch(e => {
      console.error(e);
    });
  };

  useEffect(() => {
    if (!slug) {
      return;
    }
    getStoredLogs();
    // eslint-disable-next-line
  }, [slug]);

  useEffect(() => {
    setLogs([]);
  }, [router]);

  useOutsideClick(boxMenuRef, () => {
    if (actionMenuActive) {
      setActionMenuActive(false);
    }
  });

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

  const handleBoxActionClick = () => {
    setActionMenuActive(prev => {
      return !prev;
    });
  };

  const handleReloadLogs = () => {
    getStoredLogs();
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDeleteLogs = () => {
    axios.delete(`/api/logs?app=${slug}`).then(() => {
      setLogs([]);
    }).catch(e => {
      console.error(e);
    });
  };

  return (
    <div className={styles.boxWrapperFull}>
      <div
        className={`${styles.boxAction} ${actionMenuActive ? 'active' : ''}`}
        onClick={handleBoxActionClick} ref={boxMenuRef}>
        <TbDotsVertical/>
        <ul
          className={`${styles.boxActionMenu} ${actionMenuActive ? 'active' : ''}`}>
          <li onClick={handleClearLogs}>Clear logs</li>
          <li onClick={handleReloadLogs}>Reload logs</li>
          <li onClick={handleDeleteLogs}>Delete logs</li>
        </ul>
      </div>
      <h1>{slug} logs</h1>
      <div className={styles.logsWrapper} ref={ref}>
        {displayLoading()}
        <Console logs={logs} variant="dark"/>
      </div>
    </div>
  );
};
export default ServerLogsPage;
