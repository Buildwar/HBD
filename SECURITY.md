# Política de Seguridad — HBD (Home Board Designer)

La seguridad e integridad de los datos y de la arquitectura de **HBD** es una prioridad fundamental.

---

## 1. Versiones con Soporte de Seguridad

Actualmente se proporciona soporte activo y parches de seguridad para las siguientes versiones:

| Versión | Soportada | Estado |
| :--- | :---: | :--- |
| `9.0.x` |  | Versión de producción activa |
| `< 9.0.0` | ❌ | Obsoleta / No soportada |

---

## 2. Notificación de Vulnerabilidades

Si descubres una posible vulnerabilidad o fallo de seguridad en HBD:

1. **NO publiques la vulnerabilidad en un issue público de GitHub.**
2. Comunica el hallazgo de forma privada directamente al autor del proyecto (**Adrián Palma**) a través de los canales privados designados o mediante la funcionalidad de **Private Security Advisory** en GitHub.
3. Proporciona en la comunicación:
   - Descripción detallada de la vulnerabilidad.
   - Pasos para reproducir el problema o prueba de concepto (PoC).
   - Impacto estimado en los servicios o la confidencialidad de los datos.

---

## 3. Prácticas de Seguridad Implementadas

- **Gestión de Secretos**: Ninguna credencial, token JWT o clave de base de datos se almacena en el código fuente.
- **Autenticación y Cifrado**: Firma de tokens JWT mediante clave robusta y hash de contraseñas mediante `bcryptjs` con factor de coste adecuado.
- **Validación de Entradas**: Validación de esquemas en backend con `zod`.
- **Aislamiento en Contenedores**: Separación por capas, persistencia en volúmenes dedicados y redes internas en Docker.
