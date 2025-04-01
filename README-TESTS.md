# Tests Unitarios - Backend

Este proyecto incluye tests unitarios para todos los servicios principales. Estos tests verifican el comportamiento esperado de cada servicio de forma aislada, utilizando mocks para las dependencias.

## Tests Implementados

Se han implementado tests unitarios para los siguientes servicios:

1. **ClickStatisticService**
   - Test de creación de estadísticas de clics
   - Test de consulta de todas las estadísticas
   - Test de consulta por usuario
   - Test de consulta por ID
   - Test de eliminación
   - Test de resúmenes de estadísticas

2. **UserService**
   - Test de consulta de todos los usuarios
   - Test de consulta por ID
   - Test de consulta por email
   - Test de creación de usuarios
   - Test de actualización de usuarios
   - Test de eliminación de usuarios

3. **AuthService**
   - Test de validación de usuario (credenciales)
   - Test de login
   - Test de registro de nuevos usuarios
   - Test de manejo de errores (credenciales inválidas, email ya registrado)

4. **JwtStrategy**
   - Test de validación de payload JWT

## Ejecución de los Tests

Para ejecutar todos los tests unitarios:

```bash
npm test
```

Para ejecutar los tests con modo de observación (los tests se ejecutarán automáticamente al cambiar el código):

```bash
npm run test:watch
```

Para ejecutar los tests con cobertura (generará un informe de cobertura de código):

```bash
npm run test:cov
```

Para depurar los tests:

```bash
npm run test:debug
```

## Estructura de los Tests

Cada test sigue una estructura similar:

1. **Configuración (Setup)**: Preparación del entorno de prueba, creación de mocks.
2. **Ejecución (Act)**: Llamada al método que se está probando.
3. **Verificación (Assert)**: Comprobación de que el resultado es el esperado.

## Mocks

Los tests utilizan mocks para:

- **Mongoose Models**: Para simular el comportamiento de la base de datos.
- **Servicios**: Para simular el comportamiento de servicios dependientes.
- **bcrypt**: Para simular el hash y la comparación de contraseñas.
- **JWT**: Para simular la generación de tokens.

## Cobertura de Código

Los tests están diseñados para cubrir:

- Flujos exitosos (happy path)
- Manejo de errores
- Casos límite y valores nulos
- Validaciones

Ejecuta `npm run test:cov` para ver un informe detallado de la cobertura de código. 