CREATE DATABASE  IF NOT EXISTS `muonline` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `muonline`;
-- MySQL dump 10.13  Distrib 8.0.29, for macos12 (x86_64)
--
-- Host: localhost    Database: muonline
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `MEMB_INFO`
--

DROP TABLE IF EXISTS `MEMB_INFO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MEMB_INFO` (
  `memb_guid` int NOT NULL AUTO_INCREMENT,
  `memb___id` varchar(11) NOT NULL,
  `memb__pwd` varchar(11) NOT NULL,
  `sno__numb` char(14) NOT NULL,
  `bloc_code` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`memb_guid`),
  UNIQUE KEY `memb___id_UNIQUE` (`memb___id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MEMB_INFO`
--

LOCK TABLES `MEMB_INFO` WRITE;
/*!40000 ALTER TABLE `MEMB_INFO` DISABLE KEYS */;
INSERT INTO `MEMB_INFO` VALUES (1,'pafa7a','123','12345678901234',0),(2,'test','test','23456789012345',0),(3,'banned','banned','34567890123456',1);
/*!40000 ALTER TABLE `MEMB_INFO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MEMB_STAT`
--

DROP TABLE IF EXISTS `MEMB_STAT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MEMB_STAT` (
  `memb___id` varchar(10) NOT NULL,
  `ConnectStat` tinyint DEFAULT NULL,
  `ServerName` varchar(50) DEFAULT NULL,
  `IP` varchar(15) DEFAULT NULL,
  `ConnectTM` datetime DEFAULT NULL,
  `DisConnectTM` datetime DEFAULT NULL,
  `OnlineHours` int DEFAULT '0',
  PRIMARY KEY (`memb___id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MEMB_STAT`
--

LOCK TABLES `MEMB_STAT` WRITE;
/*!40000 ALTER TABLE `MEMB_STAT` DISABLE KEYS */;
/*!40000 ALTER TABLE `MEMB_STAT` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-31 19:01:47
