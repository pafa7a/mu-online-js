import styles from '@/styles/Main.module.css';
import DashboardServerCard from '@/components/socketFetchers/DashboardServerCard';

const Home = () => {
  return (
    <>
      <DashboardServerCard boxType="box-one-fifth" server="ConnectServer"/>
      <DashboardServerCard boxType="box-one-fifth" server="JoinServer"/>
      <div className={`${styles.boxWrapper} box-one-fifth`}>
        <div className={`${styles.box}`}>
          <div className={styles.loader}>Loading example...</div>
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
