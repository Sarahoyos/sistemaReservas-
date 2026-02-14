# 🏨 Hotel Reservation System — Vanilla JS

## 📌 Descripción

Aplicación web desarrollada con **HTML + CSS + JavaScript Vanilla**, utilizando **localStorage como base de datos**.

El proyecto implementa un sistema completo de reservas para un hotel con:

- Gestión de usuarios por roles  
- CRUD completo de reservas  
- Manejo de estados  
- Validación de fechas  
- Persistencia total en localStorage  
- Protección de vistas según rol  
- Panel estadístico básico  

---

## 🎯 Reto de Prompting (≤ 8 pasos)

Este proyecto fue construido como un **reto de ingeniería por prompting**, siguiendo menos de 8 iteraciones estructuradas:

1. Definición de arquitectura y separación por capas (`core`, `services`, `pages`).  
2. Modelado de entidades (User, Reservation, Roles, Estados).  
3. Implementación de persistencia estructurada en localStorage.  
4. Desarrollo del sistema de autenticación y control de sesión.  
5. Protección de vistas por rol (Admin, Operador, Cliente).  
6. Implementación del CRUD completo de reservas.  
7. Validación robusta de fechas y reglas de negocio.  
8. Construcción del panel estadístico y control de estados.  

El objetivo fue demostrar cómo un sistema completo puede diseñarse correctamente mediante prompting estructurado y arquitectura limpia, sin frameworks.

---

## 👥 Roles del Sistema

### 🔐 Administrador
- Visualiza todas las reservas  
- Cambia estados (Pendiente, Confirmada, Cancelada)  
- Reprograma reservas  
- Elimina reservas  
- Accede al panel estadístico  
- Gestiona usuarios  

### 🛎 Operador
- Consulta agenda diaria  
- Confirma reservas  
- Reprograma fechas  

### 👤 Cliente
- Registro y autenticación  
- Crear reservas  
- Cancelar reservas propias  
- Consultar historial  

---

## 🗂 Estructura del Proyecto

/src
|
|-- index.html (Login)
|-- register.html (Registro cliente)
|-- admin.html (Panel administrador)
|-- operator.html (Panel operador)
|-- client.html (Panel cliente)
|-- stats.html (Panel estadistico)
|-- estadistico.html (Panel estadistico)
|-- acceso-denegado.html (Vista acceso denegado)
|
|-- /css
|   |-- styles.css
|
|-- /js
    |
    |-- /core (Infraestructura base)
    |   |-- constants.js
    |   |-- storage.js
    |   |-- utils.js
    |   |-- guards.js
    |
    |-- /services (Logica de negocio)
    |   |-- auth.service.js
    |   |-- users.service.js
    |   |-- reservations.service.js
    |   |-- stats.service.js
    |
    |-- /pages (Controladores por vista)
        |-- login.page.js
        |-- register.page.js
        |-- admin.page.js
        |-- operator.page.js
        |-- client.page.js
        |-- stats.page.js
