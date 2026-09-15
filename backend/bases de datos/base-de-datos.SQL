-- ============================
--   CREACIÓN Y LIMPIEZA INICIAL
-- ============================
CREATE DATABASE IF NOT EXISTS TallerMecanico;
USE TallerMecanico;

-- ⚠️ PASO 1: LIMPIEZA (Se eliminan las tablas en orden inverso a sus dependencias)
DROP TABLE IF EXISTS ServicioMecanico;
DROP TABLE IF EXISTS Servicio;
DROP TABLE IF EXISTS Auto;
DROP TABLE IF EXISTS Mecanico;
DROP TABLE IF EXISTS Cliente;

-- ============================
--   TABLA: Cliente
-- ============================
CREATE TABLE Cliente (
  IdCliente INT PRIMARY KEY AUTO_INCREMENT,
  Rut VARCHAR(12) NOT NULL UNIQUE,
  Nombre VARCHAR(100) NOT NULL,
  NumeroTelefonico VARCHAR(20),
  CorreoElectronico VARCHAR(100)
);

-- ============================
--   TABLA: Auto
-- ============================
CREATE TABLE Auto (
  IdAuto INT PRIMARY KEY AUTO_INCREMENT,
  IdCliente INT NOT NULL,
  Patente VARCHAR(10) NOT NULL UNIQUE,
  Modelo VARCHAR(50),
  Color VARCHAR(30),
  Anio INT,
  FOREIGN KEY (IdCliente) REFERENCES Cliente(IdCliente)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ============================
--   TABLA: Mecanico
-- ============================
CREATE TABLE Mecanico (
  IdMecanico INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Especialidad VARCHAR(100),
  Correo VARCHAR(100) UNIQUE,
  Contrasenia VARCHAR(255) NOT NULL,
  ROL ENUM('mecanico', 'admin') DEFAULT 'mecanico'
);

-- ============================
--   TABLA: Servicio
-- ============================
CREATE TABLE Servicio (
  IdServicio INT PRIMARY KEY AUTO_INCREMENT,
  IdCliente INT NOT NULL,
  IdAuto INT NOT NULL,
  FechaInicio DATE,
  FechaTermino DATE,
  DescripcionProblema TEXT,
  Diagnostico TEXT,
  Estado ENUM('Pendiente', 'En reparación', 'Finalizado', 'Cancelado') DEFAULT 'Pendiente',
  Precio INT, 
  FOREIGN KEY (IdCliente) REFERENCES Cliente(IdCliente)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (IdAuto) REFERENCES Auto(IdAuto)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ============================
--   TABLA INTERMEDIA: ServicioMecanico
--   (Relación Muchos a Muchos: Un servicio tiene N mecánicos, un mecánico tiene N servicios)
-- ============================
CREATE TABLE ServicioMecanico (
    IdServicio INT NOT NULL,
    IdMecanico INT NOT NULL,
    FechaAsignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (IdServicio, IdMecanico),
    FOREIGN KEY (IdServicio) REFERENCES Servicio(IdServicio)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (IdMecanico) REFERENCES Mecanico(IdMecanico)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
INSERT INTO Cliente (IdCliente, Nombre, Apellido, Telefono, Email) 
VALUES (1, 'Juan', 'Pérez', '912345678', 'juan@email.com');