-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Mag 29, 2020 alle 08:36
-- Versione del server: 8.0.18
-- Versione PHP: 7.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `UniDB`
--
CREATE DATABASE IF NOT EXISTS `UniDB` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `UniDB`;

-- --------------------------------------------------------

--
-- Struttura della tabella `Insegnamenti`
--
CREATE TABLE IF NOT EXISTS `Insegnamenti` (
  `IDIns` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Denominazione` varchar(100) NOT NULL,
  `CFU` int UNSIGNED NOT NULL,
  `SSD` varchar(100) NOT NULL,
  PRIMARY KEY (`IDIns`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Corsi`
--
CREATE TABLE IF NOT EXISTS `Corsi` (
  `IDCorso` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Denominazione` varchar(100) NOT NULL,
  `AnnoAccademico` varchar(20) NOT NULL,
  `TipoCorso` ENUM('triennale', 'magistrale', 'ciclo unico') NOT NULL,
  `CFUTirocinio` int UNSIGNED NOT NULL,
  `CFUProvaFinale` int UNSIGNED NOT NULL,
  PRIMARY KEY (`IDCorso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Docenti`
--
CREATE TABLE IF NOT EXISTS `Docenti` (
  `Matricola` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `SSD` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  PRIMARY KEY (`Matricola`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `AnagraficaDocenti`
--
CREATE TABLE IF NOT EXISTS `AnagraficaDocenti` (
  `Matricola` int UNSIGNED NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Cognome` varchar(100) NOT NULL,
  `Genere` ENUM('M', 'F', 'A') NOT NULL,
  `DataNascita` date NOT NULL,
  `LuogoNascita` varchar(200) NOT NULL,
  `CF` varchar(16) NOT NULL,
  PRIMARY KEY (`Matricola`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `AnagraficaDocenti`
  ADD CONSTRAINT `AnagraficaDocenti_ibfk_1` FOREIGN KEY (`Matricola`) REFERENCES `Docenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;
  
-- --------------------------------------------------------

--
-- Struttura della tabella `Erogazione`
--
CREATE TABLE IF NOT EXISTS `Erogazione` (
  `IDIns` int UNSIGNED NOT NULL,
  `IDCorso` int UNSIGNED NOT NULL,
  `Anno` int UNSIGNED NOT NULL,
  `aScelta` boolean NOT NULL,
  `Blocco` ENUM('1', '2', '3') NOT NULL,
  `MatDocente` int UNSIGNED NOT NULL,
  `SchedaTrasparenza` varchar(256),
  PRIMARY KEY (`IDIns`, `IDCorso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `Erogazione`
  ADD CONSTRAINT `Erogazione_ibfk_1` FOREIGN KEY (`IDIns`) REFERENCES `Insegnamenti` (`IDIns`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Erogazione_ibfk_2` FOREIGN KEY (`IDCorso`) REFERENCES `Corsi` (`IDCorso`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Erogazione_ibfk_3` FOREIGN KEY (`MatDocente`) REFERENCES `Docenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- --------------------------------------------------------

--
-- Struttura della tabella `Studenti`
--
CREATE TABLE IF NOT EXISTS `Studenti` (
  `Matricola` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `IDCorso` int UNSIGNED,
  `Anno` ENUM('1', '2', '3', '4', '5', 'Fuori Corso'),
  `Tirocinio` boolean NOT NULL DEFAULT FALSE,
  `ProvaFinale` boolean NOT NULL DEFAULT FALSE,
  `Email` varchar(100) NOT NULL,
  `Reddito` int UNSIGNED NOT NULL,
  `PrimaRata` boolean NOT NULL,
  `SecondaRata` boolean NOT NULL,
  PRIMARY KEY (`Matricola`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `Studenti`
  ADD CONSTRAINT `Studenti_ibfk_1` FOREIGN KEY (`IDCorso`) REFERENCES `Corsi` (`IDCorso`) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- --------------------------------------------------------

--
-- Struttura della tabella `AnagraficaStudenti`
--
CREATE TABLE IF NOT EXISTS `AnagraficaStudenti` (
  `Matricola` int UNSIGNED NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Cognome` varchar(100) NOT NULL,
  `Genere` ENUM('M', 'F', 'A') NOT NULL,
  `DataNascita` date NOT NULL,
  `LuogoNascita` varchar(200) NOT NULL,
  `CF` varchar(16) NOT NULL,
  PRIMARY KEY (`Matricola`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `AnagraficaStudenti`
  ADD CONSTRAINT `AnagraficaStudenti_ibfk_1` FOREIGN KEY (`Matricola`) REFERENCES `Studenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- --------------------------------------------------------

--
-- Struttura della tabella `Esami`
--
CREATE TABLE IF NOT EXISTS `Esami` (
  `IDEsame` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `IDIns` int UNSIGNED NOT NULL,
  `IDCorso` int UNSIGNED NOT NULL,
  `Data` timestamp NOT NULL,
  `Sede` varchar(200) NOT NULL,
  `Sessione` ENUM('Autunnale', 'Invernale', 'Primaverile', 'Estiva') NOT NULL,
  `Appello` ENUM('Primo', 'Secondo', 'Terzo', 'Extra') NOT NULL,
  PRIMARY KEY (`IDEsame`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `Esami`
  ADD CONSTRAINT `Esami_ibfk_1` FOREIGN KEY (`IDIns`) REFERENCES `Insegnamenti` (`IDIns`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Esami_ibfk_2` FOREIGN KEY (`IDCorso`) REFERENCES `Corsi` (`IDCorso`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- --------------------------------------------------------

--
-- Struttura della tabella `IscrizioneEsame`
--
CREATE TABLE IF NOT EXISTS `IscrizioneEsame` (
  `IDEsame` int UNSIGNED NOT NULL ,
  `MatStudente` int UNSIGNED NOT NULL,
  PRIMARY KEY (`IDEsame`, `MatStudente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `IscrizioneEsame`
  ADD CONSTRAINT `IscrizioneEsame_ibfk_1` FOREIGN KEY (`IDEsame`) REFERENCES `Esami` (`IDEsame`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `IscrizioneEsame_ibfk_2` FOREIGN KEY (`MatStudente`) REFERENCES `Studenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- --------------------------------------------------------

--
-- Struttura della tabella `CarrieraStudenti`
--
CREATE TABLE IF NOT EXISTS `CarrieraStudenti` (
  `Matricola` int UNSIGNED NOT NULL,
  `IDIns` int UNSIGNED NOT NULL ,
  `IDEsame` int UNSIGNED ,
  `Domande` varchar(1000),
  `Esito` int UNSIGNED,
  `Verbalizzazione` boolean,
  PRIMARY KEY (`Matricola`, `IDIns`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `CarrieraStudenti`
  ADD CONSTRAINT `CarrieraStudenti_ibfk_1` FOREIGN KEY (`Matricola`) REFERENCES `Studenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `CarrieraStudenti_ibfk_2` FOREIGN KEY (`IDIns`) REFERENCES `Insegnamenti` (`IDIns`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `CarrieraStudenti_ibfk_3` FOREIGN KEY (`IDEsame`) REFERENCES `Esami` (`IDEsame`) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- --------------------------------------------------------

--
-- Struttura della tabella `Ricevimenti`
--
CREATE TABLE IF NOT EXISTS `Ricevimenti` (
  `IDRicev` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `IDIns` int UNSIGNED NOT NULL,
  `MatDocente` int UNSIGNED NOT NULL,
  `Data` timestamp NOT NULL,
  `Sede` varchar(200) NOT NULL,
  `Durata` int UNSIGNED NOT NULL,
  `NumStudenti` int UNSIGNED NOT NULL,
  PRIMARY KEY (`IDRicev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `Ricevimenti`
  ADD CONSTRAINT `Ricevimenti_ibfk_1` FOREIGN KEY (`IDIns`) REFERENCES `Insegnamenti` (`IDIns`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Ricevimenti_ibfk_2` FOREIGN KEY (`MatDocente`) REFERENCES `Docenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- --------------------------------------------------------

--
-- Struttura della tabella `IscrizioneRicevimento`
--
CREATE TABLE IF NOT EXISTS `IscrizioneRicevimento` (
  `IDRicev` int UNSIGNED NOT NULL ,
  `MatStudente` int UNSIGNED NOT NULL,
  PRIMARY KEY (`IDRicev`, `MatStudente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `IscrizioneRicevimento`
  ADD CONSTRAINT `IscrizioneRicevimento_ibfk_1` FOREIGN KEY (`IDRicev`) REFERENCES `Ricevimenti` (`IDRicev`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `IscrizioneRicevimento_ibfk_2` FOREIGN KEY (`MatStudente`) REFERENCES `Studenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- --------------------------------------------------------

--
-- Struttura della tabella `Amministrazione`
--
CREATE TABLE IF NOT EXISTS `Amministrazione` (
  `Matricola` int UNSIGNED NOT NULL,
  `Nome` varchar(100) NOT NULL,
  `Cognome` varchar(100) NOT NULL,
  `Genere` ENUM('M', 'F', 'A') NOT NULL,
  `DataNascita` date NOT NULL,
  `LuogoNascita` varchar(200) NOT NULL,
  `CF` varchar(16) NOT NULL,
  `Email` varchar(100) NOT NULL,
  PRIMARY KEY (`Matricola`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Struttura della tabella `Autenticazione`
--

CREATE TABLE IF NOT EXISTS `Autenticazione` (
  `NomeUtente` varchar(30) NOT NULL,
  `Password` varchar(256) NOT NULL,
  `MatStudente` int UNSIGNED ,
  `MatDocente` int UNSIGNED,
  `MatAdmin` int UNSIGNED,
  PRIMARY KEY (`NomeUtente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `Autenticazione`
  ADD CONSTRAINT `Autenticazione_ibfk_1` FOREIGN KEY (`MatStudente`) REFERENCES `Studenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Autenticazione_ibfk_2` FOREIGN KEY (`MatDocente`) REFERENCES `Docenti` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Autenticazione_ibfk_3` FOREIGN KEY (`MatAdmin`) REFERENCES `Amministrazione` (`Matricola`) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

CREATE TABLE IF NOT EXISTS `utente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `genere` enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_regione` int(11) NOT NULL,
  `id_provincia` int(11) NOT NULL,
  `id_comune` int(11) NOT NULL,
  `data_nascita` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `autenticazione`
--
ALTER TABLE `autenticazione`
  ADD CONSTRAINT `autenticazione_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
