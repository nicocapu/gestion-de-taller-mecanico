-- Usar la base de datos de Railway
USE railway;

-- ============================
--   LIMPIEZA INICIAL
-- ============================
DROP TABLE IF EXISTS ServicioMecanico;
DROP TABLE IF EXISTS Servicio;
DROP TABLE IF EXISTS Auto;
DROP TABLE IF EXISTS Mecanico;
DROP TABLE IF EXISTS Cliente;

-- ============================
--   TABLA: Cliente
-- ============================
CREATE TABLE Cliente (
  IdCliente INT PRIMARY KEY AUTO_INCREMENT,
  Rut VARCHAR(12) NOT NULL UNIQUE,
  Nombre VARCHAR(100) NOT NULL,
  NumeroTelefonico VARCHAR(20),
  CorreoElectronico VARCHAR(100)
);

-- ============================
--   TABLA: Auto
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
--   TABLA: Mecanico
-- ============================
CREATE TABLE Mecanico (
  IdMecanico INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Especialidad ENUM('General', 'Frenos', 'Motor', 'Electricidad') NOT NULL,
  Correo VARCHAR(100) UNIQUE,
  Contrasenia VARCHAR(255) NOT NULL,
  Rol ENUM('mecanico', 'admin') DEFAULT 'mecanico'
);

-- ============================
--   TABLA: Servicio
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
--   TABLA INTERMEDIA: ServicioMecanico
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

-- ============================
--   DATOS INICIALES
-- ============================
INSERT INTO Mecanico (Nombre, Especialidad, Correo, Contrasenia, Rol)
VALUES (
  'Administrador Principal',
  'General',
  'admin@taller.com',
  '$2b$10$mT4D7rPZYW3kifmZ.Yg8aOzuxtGh6Xp4xl7tqwKBZdfi0qVnNabZO', 
  'admin'
);