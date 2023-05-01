import styles from '@/styles/Main.module.css';
import {AiOutlineReload} from 'react-icons/ai';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useEffect, useState} from 'react';

const DashboardServerCard = ({boxType = 'box-one-fifth', server}) => {
  const {sendMessage, emitter} = useWebSocket();
  const [state, setState] = useState();

  const handleLoadData = () => {
    sendMessage('isServerOnline', {
      serverName: server
    });
    sendMessage('getServerProcessInfo', {
      serverName: server
    });
    sendMessage('getNumberOfTCPConnections', {
      serverName: server
    });
  };


  useEffect(() => {
    handleLoadData();

    const isServerOnline = (payload) => {
      if (payload.serverName === server) {
        setState((prev) => {
          return {
            ...prev,
            isOnline: payload.isOnline
          };
        });
      }
    };

    const storeProcessInfo = (payload) => {
      if (payload.serverName === server) {
        setState((prev) => {
          return {
            ...prev,
            info: payload
          };
        });
      }
    };

    const storeNumberOnline = (payload) => {
      if (payload.serverName === server) {
        setState((prev) => {
          return {
            ...prev,
            connections: payload.connections
          };
        });
      }
    };
    emitter.on('isServerOnline', isServerOnline);
    emitter.on('returnProcessInfoFromServer', storeProcessInfo);
    emitter.on('returnNumberOfTCPConnections', storeNumberOnline);

    return () => {
      emitter.off('isServerOnline', isServerOnline);
      emitter.off('returnProcessInfoFromServer', storeProcessInfo);
      emitter.off('returnNumberOfTCPConnections', storeNumberOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitter]);

  const displayLoader = () => {
    if (!state?.info && state?.isOnline === undefined) {
      return (
        <div className={styles.loader}>Loading...</div>
      );
    }
    return '';
  };

  const displayStatus = () => {
    if (state?.isOnline === undefined) {
      return (
        <div>
          ...
        </div>
      );
    }

    return (
      <div className={state?.isOnline ? styles.colorGreen : styles.colorRed}>
        {state?.isOnline ? 'UP' : 'DOWN'}
      </div>
    );
  };

  const displayStatistics = () => {
    if (!state?.info || !state?.isOnline) {
      return '';
    }
    return (
      <>
        <div className={styles.flexWithSpaceBetween}>
          <div>CPU user time</div>
          <div>{state?.info?.CPU?.user}ms</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>CPU system time</div>
          <div>{state?.info?.CPU?.system}ms</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>Memory usage</div>
          <div>{state?.info?.memory}MB</div>
        </div>
        <div className={styles.flexWithSpaceBetween}>
          <div>Connected clients</div>
          <div>{state?.connections || 0}</div>
        </div>
      </>
    );
  };

  return (
    <div className={`${styles.boxWrapper} ${boxType}`}>
      <div className={styles.box}>
        {displayLoader()}
        <div className={styles.boxTitle}>
          <div>{server}</div>
          {displayStatus()}
        </div>
        {displayStatistics()}
        <div className={styles.reload} onClick={handleLoadData}>
          <AiOutlineReload/>
        </div>
      </div>
    </div>
  );
};

export default DashboardServerCard;
