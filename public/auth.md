# Kamaluso Sublimación auth.md

Este documento define el protocolo de autenticación y autorización para agentes autónomos de IA que interactúan con la plataforma Kamaluso Sublimación (https://www.kamaluso.com).

## Audiencia
Agentes de IA compradores, asistentes de compras B2B, sistemas de aprovisionamiento de talleres de sublimación e imprentas.

## Descubrimiento OAuth y Metadatos de Recursos
- **OAuth Authorization Server:** `https://www.kamaluso.com/.well-known/oauth-authorization-server`
- **Protected Resource Metadata (RFC 9728):** `https://www.kamaluso.com/.well-known/oauth-protected-resource`
- **OpenID Connect Discovery:** `https://www.kamaluso.com/.well-known/openid-configuration`
- **JWKS URI:** `https://www.kamaluso.com/.well-known/jwks.json`

## Registro de Agentes (Agent Provisioning)
- **Registro de Agente:** `POST https://www.kamaluso.com/api/agent/register`
- **Reclamo de Credencial / Token:** `POST https://www.kamaluso.com/api/agent/claim`
- **Emisión de Tokens:** `POST https://www.kamaluso.com/api/agent/token`

## Métodos de Identidad Soportados
1. **Acceso Anónimo:** Token temporal portador para lectura de catálogo y consultas técnicas de parámetros de sublimación.
2. **Afirmación de Identidad (ID-JAG):** `urn:ietf:params:oauth:token-type:id-jag` para agentes corporativos verificados.
3. **Correo Verificado (Verified Email):** Registro asociando el correo del comprador o taller para seguimiento de pedidos y cotizaciones.

## Uso de Credenciales
Todas las peticiones autenticadas deben incluir el encabezado estándar:
```http
Authorization: Bearer <TOKEN>
```

## Permisos y Alcances (Scopes)
- `read:products`: Consulta detallada de productos, variantes y stock.
- `read:catalog`: Acceso a listas de precios mayoristas.
- `create:orders`: Emisión de solicitudes de pedido o cotización.
- `read:resources`: Acceso a plantillas de diseño y guías PDF.
