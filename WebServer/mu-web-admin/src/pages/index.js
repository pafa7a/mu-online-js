import styles from '@/styles/Main.module.css';
import ServerCard from '@/components/socketFetchers/ServerCard';
import config from '@/config';
import {useServer} from '@/hooks/useServer';

const Home = () => {
  const {startAllServers, stopAllServers} = useServer();
  const renderServerCards = () => {
    const render = [];
    config.servers.forEach((server, id) => {
      render.push(
        <ServerCard key={`server-${id}`} boxType="box-one-fifth" server={server.name}/>
      );
    });
    return render;
  };

  return (
    <>
      {renderServerCards()}
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>
          <button className={`${styles.button}`} onClick={startAllServers}>Start all servers</button>
          <button className={`${styles.button} ${styles.red}`} onClick={stopAllServers}>Stop all servers</button>
        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-third box-double-height`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-third box-double-height`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-third`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-third`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-half`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-half`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-half`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-full`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-half`}>
        <div className={styles.box}>

        </div>
      </div>
      <div className={`${styles.boxWrapper} box-one-third`}>
        <div className={styles.box}>

        </div>
      </div>
    </>
  );
};

export default Home;
