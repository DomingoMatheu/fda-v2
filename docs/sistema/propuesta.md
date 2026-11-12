# Sistema de gestión del club — propuesta y plan

Documento de trabajo para la demo del sistema interno del Club S&D F.A. Domingo
Matheu y para el sistema real que vendría después. Los prompts para armarlo en
sesiones de Claude Code están en `front/PROMPTS.md` (demo y conexión del
front) y `api/PROMPTS.md` (API y migración).

## 1. Contexto

- La landing (este repo) ya está entregada y en producción.
- El club tiene un sistema de gestión viejo. Por el link que publicamos en las
  preguntas frecuentes (`CLUB_MEMBERS_PORTAL_URL` → `far.myhoost.com`) todo
  indica que es **Hoost**, un SaaS de gestión de clubes. Problemas que nos
  contaron: es viejo, se accede solo desde algunas computadoras o redes, y no
  queda claro qué puede hacer.
- Lo que recordamos del sistema actual: login, socios, cobranza, facturas o
  comprobantes, temporada (quién puede usar la pileta), empleados y plan
  familiar.
- Objetivo: una **demo navegable** para mostrarles cómo podría ser el sistema
  nuevo, cerrar un presupuesto y, si aprueban, migrar los socios al sistema
  nuevo.
- Lo que no sabemos todavía: qué base de datos usa el sistema actual y qué
  campos tiene. Eso se destraba cuando den el OK (y mejor aún: pidiendo una
  exportación, ver sección 7).

## 2. Opinión sobre el enfoque

**Demo como rama de la landing: sí.** Es lo más rápido y lo más vendedor:
reutiliza la identidad visual (tokens, tipografías, escudo), los datos del club
(`club-info.ts`, `disciplines.ts`, `fees.ts`) y el deploy. La demo vive en la
rama `feat/sistema-demo` bajo la ruta `/sistema`. Vercel genera una URL de
preview por rama, así que se puede mostrar desde esa URL sin tocar `main`. Si
dicen que no, se borra la rama y la landing queda como está.

**Sistema real: solo la API va a un repo aparte.** Stack definido:
**NestJS + Prisma + MySQL**, en un repo nuevo dentro de la organización
`LumarSoft` de GitHub: `LumarSoft/fda-api`, ya creado el 11/11/2026 a partir
del starter `LumarSoft/prisma_api` (NestJS 11, Prisma 7, MySQL, JWT) y
clonado en `fda-v2/api/`, al lado de la landing (`fda-v2/front/`), para tener
los dos repos en una misma sesión abierta en `fda-v2/`. El front del sistema se queda en este repo bajo `/sistema`: un solo
deploy, misma identidad, y si al club le gusta se mergea la rama a producción
y listo. Los tipos de dominio que definimos ahora son el contrato compartido
entre el front, los DTOs de la API y el schema de Prisma.

**La demo no tiene backend.** Datos de prueba generados de forma determinista
en memoria, login falso con cookie, y flujos que se sienten reales (registrar
un cobro cambia el estado del socio, el control de ingreso responde en el
momento). Lo que vendemos es la claridad y los flujos, no la infraestructura.

**La migración se define más adelante.** Depende de cómo entregue los datos
el sistema actual: una exportación (Excel o CSV), acceso a su base o un
volcado. Sea cual sea el origen, el destino del mapeo son los tipos de
dominio de `app/sistema/_types/`, así que lo que hagamos ahora no se pierde.

## 3. Alcance de la demo

| Módulo | Ruta | Qué muestra | Momento demo |
| --- | --- | --- | --- |
| Login | `/sistema/login` | Acceso con usuario y clave, roles | "Entra desde cualquier compu o celular" |
| Inicio | `/sistema` | Socios activos, % al día, cobrado y pendiente del mes, carnets de pileta, tareas de hoy, últimos cobros, actividad reciente | "Abrís y ya sabés cómo viene el mes" |
| Socios | `/sistema/socios`, `/socios/[id]`, `/socios/nuevo` | Buscador, filtros (categoría, estado de cuota, disciplina), ficha completa, estado de cuenta, alta de socio | "Buscás por DNI y tenés todo" |
| Grupos familiares | `/sistema/grupos-familiares` | Titular, plan básico/pleno, integrantes, cuota del grupo, estado | "El plan familiar se cobra una sola vez" |
| Cobranza | `/sistema/cobranza` | Cuotas del período, resumen (esperado, cobrado, pendiente), pestañas pendientes/cobradas/morosos, registrar cobro con recargo automático, recordatorio por WhatsApp | "Registrás el cobro y el socio queda al día" |
| Comprobantes | `/sistema/comprobantes`, `/comprobantes/[id]` | Recibos numerados, búsqueda, recibo imprimible | "Imprimís o mandás el recibo" |
| Temporada | `/sistema/temporada` | Temporada vigente, carnets de pileta, aptos médicos y vencimientos, **control de ingreso por DNI** (habilitado o no, con motivos), ingresos de hoy | "Portería tipea el DNI y ve verde o rojo" |
| Empleados | `/sistema/empleados` | Legajo, puesto, área, tipo de contratación, horario, estado | "Todo el personal en un lugar" |
| Disciplinas | `/sistema/disciplinas` | Inscriptos por disciplina, cuota, responsable, horarios | "Sabés cuántos hay en hockey" |
| Reportes | `/sistema/reportes` | Recaudación por mes, morosidad por categoría, altas y bajas, socios por disciplina, medios de pago | "Números para la comisión" |
| Configuración | `/sistema/configuracion` | Valores de cuotas, recargo por mora, medios de pago, usuarios y roles, integraciones (próximamente) | "Lo cambia el club, sin programador" |

## 4. Funcionalidades que facilitan el control del club

Marcadas con ✅ las que entran en la demo; las demás son ideas para el
presupuesto y las fases siguientes.

**Cobranza**

- ✅ Estado de cuota derivado automáticamente: al día, en mora (1 o 2 cuotas),
  moroso (3 o más). Nunca se carga a mano.
- ✅ Recargo por mora calculado al registrar el cobro.
- ✅ Recordatorio por WhatsApp con mensaje prearmado (link `wa.me`, igual que
  en la landing). Después: envío automático por WhatsApp Business o email.
- ✅ Aviso de deuda por correo, a un socio o a todos los morosos de una vez,
  con vista previa del mail (monto, meses adeudados, cómo pagar) y registro de
  quién fue avisado y cuándo, para no avisar dos veces seguidas. En la demo el
  envío es simulado; en el sistema real sale desde el correo de cobranzas.
- Link de pago de Mercado Pago por cuota y conciliación automática por webhook:
  el socio paga desde el celular y la cuota se marca paga sola.
- Débito automático con adhesión.
- Generación automática de las cuotas de cada mes (hoy depende de que alguien
  las genere).

**Ingreso y pileta**

- ✅ Control de ingreso por DNI o número de socio: responde habilitado o no y
  por qué (cuota vencida, sin apto médico, sin carnet de temporada, socio dado
  de baja).
- ✅ Apto médico con vencimiento y alertas antes de que venza.
- ✅ Registro de ingresos del día.
- Carnet digital con QR en el celular del socio.
- Cobro de entradas de visitantes (mayores, menores, autos, motos) con los
  valores de `fees.ts`.

**Socios y plan familiar**

- ✅ Ficha única con datos, grupo familiar, disciplinas, pileta, cuenta y pagos.
- ✅ Alta de socio que genera la inscripción y la primera cuota.
- Cambio de plan familiar sugerido por edad de los hijos (básico → pleno al
  cumplir 5; el hijo sale del grupo a los 18 y pasa a individual).
- Portal de socios (autogestión): ver deuda, pagar, bajar comprobantes, subir
  el apto médico. Reemplaza el usuario compartido que hoy publica el FAQ.

**Reservas** (hoy es una planilla a mano, según el FAQ)

- Reservas de quinchos y del salón con calendario, lista de invitados no socios
  (nombre, apellido, DNI) y cobro del 50 % de la entrada cuando corresponde.

**Disciplinas y empleados**

- ✅ Inscriptos, cuota por disciplina y responsable.
- Lista de asistencia para profesores y liquidación por porcentaje.
- ✅ Legajo de empleados con puesto, horario y estado. Después: turnos,
  licencias y vencimientos de documentación.

**Transversales**

- ✅ Roles y permisos: administrador, secretaría, tesorería, portería.
- ✅ Actividad reciente (quién hizo qué). En el sistema real, auditoría
  completa.
- ✅ Funciona desde cualquier red y dispositivo (web responsive).
- Exportar a Excel desde cualquier listado.
- Backups automáticos diarios de la base.

## 5. Modelo de datos

Los tipos ya están escritos en `app/sistema/_types/` y son el contrato para
el schema de Prisma:

- `member.ts`: `Member`, `FamilyGroup`, `Address`, `MedicalClearance`,
  `NewMemberInput`. Categorías: individual, menor, jubilado, familiar (se cobra
  por el grupo), vitalicio (exento). Planes familiares: básico y pleno.
- `billing.ts`: `Fee` (cuota: social, inscripción, disciplina, temporada),
  `Payment`, `Receipt`, `RegisterPaymentInput`, `MemberBalance`,
  `DebtNotice` (aviso de deuda enviado: a quién, cuándo, por qué canal y por
  cuánto). El estado
  guardado es pendiente, paga o anulada; "vencida" se deriva de la fecha de
  vencimiento, nunca se guarda.
- `season.ts`: `Season`, `PoolPass`, `AccessLog`, `AccessCheck`.
- `staff.ts`: `Employee`, `DisciplineProgram` (la disciplina de la landing más
  cuota, horario y responsable), `Enrollment`.
- `auth.ts`: `SystemUser`, `UserRole`, `Permission`, `ActivityEntry`.

Reglas derivadas (van en helpers puros, no en componentes):

- Estado de cuota de un socio = sus cuotas pendientes vencidas. Un socio
  "familiar" hereda el estado del titular de su grupo, porque las cuotas se
  emiten al titular.
- Acceso a la pileta = socio activo **y** al día **y** apto médico vigente
  **y** carnet de temporada pago.
- Número de recibo correlativo por punto de venta (`0001-00001234`).

## 6. Arquitectura propuesta para el sistema real

```
Front (Next.js, este repo, ruta /sistema)
   │  REST + JWT (roles)
   ▼
API (NestJS, repo LumarSoft/fda-api)  ──  Prisma  ──  MySQL
   │
   ├─ Mercado Pago (links de pago, webhooks)
   ├─ WhatsApp Business / email (recordatorios)
   └─ ARCA (facturación electrónica, solo si el contador lo pide)
```

- Hosting: Vercel para el front; Railway, Render, Fly o un VPS para la API;
  MySQL en PlanetScale, Railway, Aiven o el mismo VPS, con backups
  automáticos diarios.
- Autenticación: JWT con Passport en NestJS, roles en la base, cookies
  `httpOnly`. La demo imita esto con una cookie de sesión.
- Los tipos de `app/sistema/_types/` se replican como DTOs y como modelos de
  Prisma. Más adelante pueden vivir en un paquete compartido.

## 7. Plan de migración (a definir con el club)

1. Ver cómo entrega la información el sistema actual: exportación (Excel o
   CSV), acceso a su base o un volcado. Según eso se elige cómo leerla; los
   pasos que siguen valen para cualquier origen.
2. Escribir un script de mapeo en TypeScript (`origen → tipos de dominio`) con
   un informe de validación: DNI duplicados, fechas inválidas, socios sin
   categoría, cuotas sin socio.
3. Importar en una base de prueba con Prisma. Revisar con Secretaría los
   casos raros.
4. Correr los dos sistemas en paralelo un mes (cobranza en los dos) para
   verificar que los saldos coinciden.
5. Corte: importación final, baja del sistema viejo, capacitación.

## 8. Fases para el presupuesto

- **Fase 0 — Demo (esta rama).** Todo lo marcado con ✅ con datos de prueba.
- **Fase 1 — MVP productivo.** API + base, login real con roles, socios,
  grupos familiares, cobranza, comprobantes, temporada y control de ingreso,
  empleados, migración de datos, capacitación.
- **Fase 2 — Menos trabajo manual.** Mercado Pago, recordatorios automáticos,
  portal de socios, reservas de quinchos y salón, exportación a Excel.
- **Fase 3 — Extras.** Reportes avanzados, carnet digital con QR, asistencia de
  disciplinas, facturación electrónica si hace falta, app instalable (PWA).

## 9. Decisiones técnicas de la demo

- Ruta `/sistema` con dos route groups: `(auth)` para el login y `(app)` para
  el sistema, que verifica la cookie en su `layout.tsx` y redirige al login.
- Login y logout con Server Actions (`app/sistema/_actions/auth.ts`); la
  cookie guarda el usuario de demo. Credenciales de demo visibles en el login:
  usuario `secretaria`, clave `matheu2026` (también `admin`, `tesoreria` y
  `porteria` con la misma clave, para mostrar los roles).
- Estado en el cliente con Context + `useReducer` (`SystemProvider`) sembrado
  con los datos de prueba; las acciones (registrar cobro, alta de socio, emitir
  carnet, cargar apto, registrar ingreso) mutan ese estado para que la demo se
  sienta real. Sin persistencia: recargar la página vuelve al estado inicial.
- Fecha "de hoy" fija en `app/sistema/_lib/clock.ts` (`2026-11-11`) para que
  los datos sean deterministas entre servidor y cliente. En el sistema real se
  usa el reloj del servidor.
- Datos de prueba generados con un generador determinista (seed fija), unos 90
  socios, 16 grupos familiares, cuotas de enero a noviembre de 2026, pagos,
  recibos, carnets, 14 empleados y 4 usuarios.
- CSS plano con prefijo `sys-` en `app/styles/sistema/`, importado solo desde
  `app/sistema/layout.tsx` (no desde `globals.css`, para no cargarlo en la
  landing). Reutiliza los tokens de `base.css`.
- `robots: noindex` en todo `/sistema` y fuera del sitemap.
- Tests e2e en `e2e/sistema.spec.ts` (login, inicio, socios, cobranza,
  control de ingreso), en los dos proyectos de Playwright.
