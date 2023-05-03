import styles from '@/styles/Main.module.css';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useEffect, useRef, useState} from 'react';
import {TbDotsVertical} from 'react-icons/tb';
import useOutsideClick from '@/hooks/useOutsideClick';
import {useRouter} from 'next/router';

const ServerCard = ({boxType = 'box-one-fifth', server}) => {
  const router = useRouter();
  const ref = useRef();
  const {sendMessage, emitter} = useWebSocket();
  const [isOnline, setIsOnline] = useState();
  const [processInfo, setProcessInfo] = useState();
  const [actionMenuActive, setActionMenuActive] = useState(false);
  const [connectedClients, setConnectedClients] = useState(0);

  const getServerStatus = () => {
    sendMessage('getServerStatus', {
      serverName: server
    });
  };

  const startServer = () => {
    sendMessage('startServer', {
      serverName: server
    });
  };

  const stopServer = () => {
    sendMessage('stopServer', {
      serverName: server
    });
  };

  const updateServerStats = () => {
    if (!isOnline) {
      return;
    }
    sendMessage('getServerProcessInfo', {
      serverName: server
    });
    sendMessage('getNumberOfTCPConnections', {
      serverName: server
    });
  };

  useEffect(() => {
    getServerStatus();

    const receiveStartServer = payload => {
      if (payload.serverName === server) {
        const online = payload.isOnline;
        setIsOnline(online);
      }
    };

    const storeProcessInfo = payload => {
      if (payload.serverName === server) {
        setProcessInfo(payload);
      }
    };

    const storeNumberOfTCPConnections = payload => {
      if (payload.serverName === server) {
        setConnectedClients(payload.connections);
      }
    };


    emitter.on('setServerStatus', receiveStartServer);
    emitter.on('serverStarted', getServerStatus);
    emitter.on('serverStopped', getServerStatus);
    emitter.on('setProcessInfoFromServer', storeProcessInfo);
    emitter.on('setNumberOfTCPConnections', storeNumberOfTCPConnections);

    return () => {
      emitter.off('setServerStatus', receiveStartServer);
      emitter.off('serverStarted', getServerStatus);
      emitter.off('serverStopped', getServerStatus);
      emitter.off('setProcessInfoFromServer', storeProcessInfo);
      emitter.off('setNumberOfTCPConnections', storeNumberOfTCPConnections);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitter]);

  useEffect(() => {
    let interval;
    if (isOnline) {
      interval = setInterval(updateServerStats, 1000);
    } else {
      setProcessInfo();
    }
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useOutsideClick(ref, () => {
    if (actionMenuActive) {
      setActionMenuActive(false);
    }
  });

  const displayLoader = () => {
    if (isOnline === undefined) {
      return (
        <div className={styles.loader}>Loading...</div>
      );
    }
    return '';
  };

  const displayStatus = () => {
    if (isOnline === undefined) {
      return (
        <div>
          ...
        </div>
      );
    }

    return (
      <div className={isOnline ? styles.colorGreen : styles.colorRed}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
    );
  };

  const displayStartServer = () => {
    if (isOnline) {
      return '';
    }
    return (
      <li onClick={startServer}>
        Start server
      </li>
    );
  };

  const displayStopServer = () => {
    if (!isOnline) {
      return '';
    }
    return (
      <li onClick={stopServer}>
        Stop server
      </li>
    );
  };

  const displayWatchLogs = () => {
    if (!isOnline) {
      return '';
    }
    return (
      <li onClick={() => {
        router.push(`/logs/${server}`).then();
      }}>
        Watch logs
      </li>
    );
  };

  const handleBoxActionClick = () => {
    setActionMenuActive(prev => {
      return !prev;
    });
  };

  const displayStatistics = () => {
    if (!processInfo) {
      return '';
    }
    return (
      <>
        <div className={styles.flexWithSpaceBetween}>
          <div>CPU user time</div>
          <div>{processInfo?.CPU?.user}ms</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>CPU system time</div>
          <div>{processInfo?.CPU?.system}ms</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>Memory usage</div>
          <div>{processInfo?.memory}MB</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>TCP connections</div>
          <div>{connectedClients}</div>
        </div>
      </>
    );
  };

  return (
    <div className={`${styles.boxWrapper} ${boxType}`}>
      <div className={styles.box}>
        <div className={`${styles.boxAction} ${actionMenuActive ? 'active' : ''}`} onClick={handleBoxActionClick} ref={ref}>
          <TbDotsVertical/>
          <ul className={`${styles.boxActionMenu} ${actionMenuActive ? 'active' : ''}`}>
            <li onClick={getServerStatus}>Refresh</li>
            {displayStartServer()}
            {displayWatchLogs()}
            {displayStopServer()}
          </ul>
        </div>
        {displayLoader()}
        <div className={styles.boxTitle}>
          <div>{server}</div>
          {displayStatus()}
        </div>
        {displayStatistics()}
      </div>
    </div>
  );
};

export default ServerCard;
