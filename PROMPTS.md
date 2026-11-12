# Prompts de la demo del sistema

Cada bloque es un mensaje para pegar en una sesión de Claude Code abierta en
`fda-v2/` (la carpeta que contiene `front/` y `api/`) o directamente en
`front/`, con la landing en la rama `feat/sistema-demo`. La idea y las
decisiones están en [docs/sistema/propuesta.md](./docs/sistema/propuesta.md);
los prompts de la API y de la migración están en `api/PROMPTS.md`.

Cómo ejecutarlos:

1. Abrí una sesión nueva en `fda-v2/` (o en `front/`) con el modelo que
   quieras usar para programar, y pasá la landing a la rama de la demo:
   `git -C front checkout feat/sistema-demo`.
2. Pegá el **Prompt 0** como primer mensaje. Es el contexto común; en una
   sesión larga alcanza con mandarlo una vez.
3. Pegá los prompts 1 a 7 en orden, uno por vez. Revisá el resultado entre uno
   y otro (cada prompt termina con qué verificar) antes de mandar el
   siguiente. Si abrís una sesión nueva a mitad de camino, repetí el Prompt 0.
4. El **Prompt C** va después del OK del club, cuando la API ya exista.

---

## Prompt 0 — Contexto común

```
Vamos a armar la demo de un sistema de gestión interno para el Club S&D F.A.
Domingo Matheu dentro del repo de la landing del club (`front/`, si la sesión
está abierta en `fda-v2/`; todas las rutas de este prompt son relativas a esa
carpeta), en la rama `feat/sistema-demo`, bajo la ruta `/sistema`. Al lado
está `api/`, el repo de la API, que no se toca en la demo.

Antes de escribir código leé, en este orden:
1. `docs/sistema/propuesta.md`: la idea completa, los módulos, las
   funcionalidades, el modelo de datos y las decisiones técnicas de la demo.
   Esas decisiones ya están tomadas; no las vuelvas a discutir.
2. `CLAUDE.md`, `AGENTS.md` y `docs/rules/*.md`: reglas del repo. Resumen:
   Next.js 16 App Router (leé la doc en `node_modules/next/dist/docs/` antes
   de usar cualquier API, cambió respecto de tu entrenamiento), React 19,
   TypeScript estricto sin `any`, CSS plano con tokens de
   `app/styles/base.css` (nada de clases de Tailwind), lógica en hooks
   `use-*.ts` separados de los componentes, datos estáticos en archivos de
   datos y no en JSX, servicios en `app/_services/`, sin `console.log`, sin
   `React.memo`/`useMemo`/`useCallback` salvo problema medido. Código,
   comentarios y commits en inglés; textos para el usuario en castellano
   rioplatense con "vos". Prettier formatea (`npm run format`).
3. `app/sistema/_types/*.ts`: los tipos de dominio ya escritos. Son el
   contrato; ajustalos solo si encontrás algo que no cierra y avisame qué
   cambiaste.
4. La landing, para reutilizar: `app/_components/club-info.ts` (datos del
   club), `disciplines.ts` (disciplinas), `fees.ts` (cuotas vigentes),
   `whatsapp.ts` (links de WhatsApp), los hooks `use-escape-key.ts`,
   `use-focus-trap.ts` y `use-menu.ts`, y `app/styles/base.css` (tokens,
   tipografías `--f-display`, `--f-body`, `--f-mono`).

Estructura acordada (todo autocontenido para poder borrarlo o extraerlo):

- `app/sistema/layout.tsx`: importa el CSS del sistema y define metadata con
  `robots: { index: false, follow: false }`.
- `app/sistema/(auth)/login/page.tsx`: login.
- `app/sistema/(app)/layout.tsx`: lee la cookie de sesión con `await cookies()`,
  redirige a `/sistema/login` si no hay sesión válida, y envuelve todo con el
  `SystemProvider` y el `SystemShell` (barra lateral + barra superior).
- `app/sistema/(app)/**/page.tsx`: una página por módulo, según la tabla de
  rutas de la propuesta. Las páginas son Server Components finitos que renderizan
  un componente cliente de contenido (`*-view.tsx`).
- `app/sistema/_actions/auth.ts`: `'use server'`, `login` y `logout`.
- `app/sistema/_components/`: shell, componentes compartidos de UI
  (`page-header`, `stat-card`, `status-badge`, `data-table`, `modal`,
  `toast`, `icons`), las vistas de cada módulo y sus hooks `use-*.ts`.
- `app/sistema/_data/`: datos de prueba (listas de nombres, cuotas, disciplinas,
  empleados, usuarios) y el generador determinista `seed.ts`.
- `app/sistema/_lib/`: helpers puros (`clock.ts`, `format.ts`, `period.ts`,
  `random.ts`, `billing.ts`, `pool-access.ts`, `permissions.ts`).
- `app/styles/sistema.css` importa los archivos de `app/styles/sistema/`
  (`base.css`, `shell.css`, `components.css` y uno por módulo). Todas las
  clases llevan el prefijo `sys-`. No tocar `app/globals.css`.

Convenciones de la demo:
- Fecha de hoy fija: `DEMO_TODAY = "2026-11-11"` en `_lib/clock.ts`; toda
  lógica de fechas pasa por ahí.
- Estado en el cliente: Context + `useReducer` en `SystemProvider`, con el
  hook `useSystem()` que expone el estado y las acciones (registerPayment,
  addMember, issuePoolPass, recordMedicalClearance, recordAccess,
  setMemberStatus, notify). Sin persistencia.
- Los componentes cliente leen datos estáticos importando los archivos de
  datos; el estado mutable sale de `useSystem()`.
- Moneda en pesos con separador de miles con punto (`$ 44.000`), fechas
  `dd/mm/aaaa`, períodos como "Noviembre 2026".
- Estética: misma familia que la landing (verde profundo `--green-deep` para
  la barra lateral, crema y blanco para el contenido, amarillo para acentos,
  display para títulos, mono para etiquetas). Es una app de gestión: tablas
  densas, claras, con buen contraste y uso cómodo en celular.
- No commitees ni pushees sin que te lo pida. Al terminar cada etapa corré
  `npm run lint` y `npx tsc --noEmit`, y verificá en el navegador con el
  servidor `dev` de `.claude/launch.json`.

Contestame siempre en castellano rioplatense.
```

---

## Prompt 1 — Base: helpers, datos de prueba y store

```
Etapa 1 de la demo: la base de datos en memoria. No hagas páginas todavía.

1. `app/sistema/_lib/`:
   - `clock.ts`: `DEMO_TODAY`, `today()`, `daysBetween`, `addDays`,
     `isBefore`.
   - `period.ts`: período `YYYY-MM`: `periodOf(date)`, `addMonths`,
     `periodsBetween`, `periodLabel("2026-11") → "Noviembre 2026"`,
     `periodDueDate` (vence el 10 de cada mes).
   - `format.ts`: `formatMoney`, `formatDate`, `formatDateTime`, `fullName`,
     `age`.
   - `random.ts`: PRNG determinista (mulberry32) con `pick`, `int`, `chance`,
     `shuffle`.
   - `billing.ts`: `feeState(fee, today)`, `memberFees`, `billingMemberId`
     (el titular si el socio es familiar), `memberBalance(member, state)`
     que devuelve `MemberBalance` con el estado al-dia / en-mora (1 o 2
     cuotas vencidas) / moroso (3 o más) / exento (vitalicio), y
     `surchargeFor(fees, today)` con el recargo por mora de la configuración.
   - `pool-access.ts`: `checkPoolAccess(member, state, today)` → `AccessCheck`
     con los motivos en castellano ("Cuota vencida desde Septiembre 2026",
     "Apto médico vencido el 03/08/2026", "Sin carnet de temporada",
     "Socio dado de baja").
   - `permissions.ts`: `PERMISSIONS_BY_ROLE` y `can(user, permission)`.
2. `app/sistema/_data/`:
   - `settings.ts`: cuotas numéricas por categoría y plan (espejo de
     `app/_components/fees.ts`, con un comentario que lo diga), recargo por
     mora (10 %), día de vencimiento, precio del carnet de temporada,
     cuotas por disciplina, punto de venta de los recibos.
   - `disciplines.ts`: `DISCIPLINE_PROGRAMS` armado a partir de
     `DISCIPLINES` de la landing (id = slug del nombre) más cuota, horario y
     responsable.
   - `employees.ts`: 14 empleados realistas (secretaría, tesorería, 3 de
     portería por turnos, mantenimiento, 2 guardavidas de temporada, buffet,
     profesores de hockey, vóley, patín y taekwondo).
   - `users.ts`: 4 usuarios (`admin`, `secretaria`, `tesoreria`, `porteria`),
     la clave de demo `matheu2026` y los permisos por rol.
   - `names.ts`: listas de nombres, apellidos, calles de Zona Sur de Rosario.
   - `seed.ts`: `buildSeed(): SystemState` determinista: unos 90 socios con
     DNI, fechas de nacimiento y números de socio coherentes con la
     antigüedad; 16 grupos familiares (titular, cónyuge, 1 a 3 hijos) con plan
     según la edad de los hijos; individuales, menores, jubilados y 3
     vitalicios; inscripciones a disciplinas (55 % en una, 10 % en dos);
     cuotas de enero a noviembre de 2026 (social al titular o al individual,
     disciplina por inscripto) con perfiles de pago puntual, atrasado y
     moroso; pagos y recibos correlativos para las pagas; temporada
     2025/2026 cerrada y 2026/2027 en inscripción con carnets pedidos por
     unos 45 socios (parte pagos, parte con apto vencido o sin apto);
     ingresos de hoy en portería; actividad reciente.
3. `app/sistema/_components/system-provider.tsx` + `use-system.ts`: Context y
   reducer con las acciones del Prompt 0. `registerPayment` crea el pago y el
   recibo, marca las cuotas pagas y agrega actividad; `addMember` asigna
   número de socio, crea la inscripción y la cuota del mes; `issuePoolPass`
   crea la cuota de temporada y el carnet; `recordMedicalClearance` guarda el
   apto; `recordAccess` agrega al registro de ingresos; `notify` muestra un
   aviso (toast) que se cierra solo.

Terminá con `npm run lint` y `npx tsc --noEmit` en verde, y contame en pocas
líneas qué números salieron del seed (socios por categoría, morosos, carnets).
```

---

## Prompt 2 — Login, layout y navegación

```
Etapa 2: entrar al sistema y moverse por él.

1. `app/sistema/_actions/auth.ts` (`'use server'`): `login(prevState,
   formData)` valida usuario y clave contra `_data/users.ts`, setea la cookie
   `fda-sistema-session` (httpOnly, sameSite lax, path `/sistema`, 8 horas)
   con el usuario, y redirige a `/sistema`; con credenciales malas devuelve
   `{ error }`. `logout()` borra la cookie y redirige al login. Leé primero
   `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`
   y `.../01-getting-started/07-mutating-data.md`.
2. `app/sistema/_lib/session.ts`: `getSession()` lee la cookie y devuelve el
   `SystemUser` o `null`.
3. `app/sistema/(auth)/login/page.tsx`: pantalla a pantalla completa con el
   escudo, el nombre del club y un formulario con `useActionState`. Mostrá las
   credenciales de demo (usuario `secretaria`, clave `matheu2026`) y un
   selector rápido de rol para probar `admin`, `tesoreria` y `porteria`.
4. `app/sistema/layout.tsx` (CSS + metadata noindex) y
   `app/sistema/(app)/layout.tsx` (verifica la sesión, redirige, envuelve con
   `SystemProvider` y `SystemShell`).
5. `SystemShell`: barra lateral con el escudo, los módulos (Inicio, Socios,
   Grupos familiares, Cobranza, Comprobantes, Temporada, Empleados,
   Disciplinas, Reportes, Configuración) filtrados por permisos del rol,
   ítem activo según `usePathname`, usuario y rol abajo con botón de salir
   (`logout`). En celular la barra se vuelve un menú desplegable reutilizando
   `useMenu`, `useEscapeKey` y `useFocusTrap` de `app/_components/`.
   Barra superior con el título de la página y un buscador global de socios
   (por nombre, DNI o número) que lleva a la ficha.
6. Páginas vacías para cada módulo con `PageHeader` para poder navegar.
7. Sacá `/sistema` del sitemap (ya no aparece, confirmalo) y agregá una regla
   `disallow: /sistema` en `app/robots.ts`.

Verificá en el navegador: sin cookie, `/sistema` redirige al login; con
credenciales malas muestra el error; con las buenas entra; el menú funciona en
celular; salir vuelve al login. `npm run lint` y `npx tsc --noEmit` en verde.
```

---

## Prompt 3 — Inicio, socios y grupos familiares

```
Etapa 3: las pantallas que más se van a mirar.

1. Inicio (`/sistema`), `dashboard-view.tsx`:
   - Tarjetas: socios activos, % al día, cobrado en el mes, pendiente del mes,
     carnets de pileta emitidos para la temporada vigente.
   - "Para hoy": morosos a contactar (los 5 con más deuda, con botón de
     WhatsApp usando `whatsappUrl` y un mensaje prearmado con el nombre y el
     monto), aptos médicos que vencen en 30 días, cumpleaños de la semana.
   - Últimos 8 cobros y actividad reciente.
   - Recaudación por mes del año (barras en SVG inline, sin librerías; leé la
     skill `dataviz` si está disponible antes de dibujar).
2. Socios (`/sistema/socios`), `members-view.tsx` + `use-member-filters.ts`:
   buscador por nombre, DNI o número; filtros por categoría, estado de cuota,
   estado del socio y disciplina; tabla con número, nombre, DNI, categoría,
   grupo, estado de cuota (badge), deuda y último pago; contador de
   resultados; botón "Nuevo socio". Las filas llevan a la ficha.
3. Ficha (`/sistema/socios/[id]`), `member-detail.tsx`: encabezado con
   nombre, número, categoría y badges de estado; datos personales y de
   contacto; grupo familiar con sus integrantes; disciplinas; pileta (carnet y
   apto); estado de cuenta con las cuotas (período, concepto, importe,
   vencimiento, estado) y los pagos. Acciones: "Registrar cobro" (modal
   compartido con Cobranza: elegir cuotas pendientes, medio de pago, ver
   recargo y total, confirmar), "Recordar por WhatsApp", "Suspender" o
   "Reactivar". `notFound()` si el id no existe.
4. Nuevo socio (`/sistema/socios/nuevo`), `new-member-form.tsx` +
   `use-new-member-form.ts`: formulario con validación mínima (nombre,
   apellido, DNI único, fecha de nacimiento, categoría, medio de pago,
   disciplinas); al guardar despacha `addMember`, muestra el aviso y lleva a
   la ficha nueva.
5. Grupos familiares (`/sistema/grupos-familiares`), `family-groups-view.tsx`:
   tarjetas o tabla con titular, plan, integrantes (con edad), cuota mensual,
   estado de cuota del grupo; aviso cuando el plan no coincide con la edad de
   los hijos.

Verificá en el navegador el flujo completo: buscar un moroso, registrar el
cobro, ver que queda al día en la ficha, en el listado y en el inicio. Probá
también en ancho de celular. `npm run lint` y `npx tsc --noEmit` en verde.
```

---

## Prompt 4 — Cobranza y comprobantes

```
Etapa 4: el módulo que usa Tesorería todos los días.

1. Cobranza (`/sistema/cobranza`), `collections-view.tsx` +
   `use-collections.ts`:
   - Selector de período (mes y año, por defecto el actual) y tarjetas:
     esperado, cobrado, pendiente, % cobrado.
   - Pestañas: Pendientes del período, Cobradas del período, Morosos (todos
     los socios con cuotas vencidas, ordenados por deuda, con cuántos meses
     deben y desde cuándo).
   - Tabla con socio, concepto, importe, vencimiento, estado, y en cada fila
     "Cobrar" (abre el modal de cobro del Prompt 3) o "Recordar por
     WhatsApp" para los morosos.
   - Botón "Registrar cobro" general: el modal permite buscar el socio y luego
     elegir sus cuotas.
2. Comprobantes (`/sistema/comprobantes`), `receipts-view.tsx`: tabla con
   número, fecha, socio, concepto resumido, medio de pago e importe; buscador
   por número o socio; filtro por período.
3. Recibo (`/sistema/comprobantes/[id]`), `receipt-document.tsx`: documento
   imprimible con el escudo, los datos del club (`club-info.ts`), el número,
   la fecha, el socio, el detalle de ítems, el total, el medio de pago y quién
   lo registró. Botón "Imprimir" (`window.print()`) y estilos de impresión
   que ocultan la barra lateral. Nota al pie: "Comprobante interno, no válido
   como factura".

Verificá: registrar un cobro desde Cobranza genera el recibo y aparece en
Comprobantes; el recibo se ve bien en vista previa de impresión; los números
del período cambian al registrar. `npm run lint` y `npx tsc --noEmit`.
```

---

## Prompt 5 — Temporada de pileta y control de ingreso

```
Etapa 5: el módulo que más les va a gustar a Portería.

Temporada (`/sistema/temporada`), `season-view.tsx` con tres pestañas:

1. Control de ingreso (`access-check.tsx` + `use-access-check.ts`): un campo
   grande para DNI o número de socio con foco automático; al buscar muestra
   una tarjeta verde "HABILITADO" o roja "NO HABILITADO" con nombre, número,
   categoría, foto genérica y los motivos de `checkPoolAccess`. Botón
   "Registrar ingreso" (despacha `recordAccess`) y, si está denegado por
   cuota, un atajo a "Registrar cobro". Si el DNI no existe, ofrece el alta de
   socio o el ingreso como visitante con los valores de `VISITOR_FEES` de la
   landing.
2. Carnets (`pool-passes.tsx`): temporada vigente con fechas, precio y
   estado; tarjetas de carnets emitidos, pagos, pendientes de pago, sin apto
   médico; tabla de socios con carnet y filtros por situación; acciones
   "Emitir carnet" (crea la cuota de temporada), "Cobrar carnet" y "Cargar
   apto médico" (modal con fecha de vencimiento).
3. Ingresos de hoy (`access-log.tsx`): registro del día con hora, DNI,
   socio, resultado y motivo, más un contador de permitidos y denegados.

Verificá: buscar un socio al día con carnet (verde), uno moroso (rojo con
motivo), uno sin apto (rojo), cargar el apto y volver a buscarlo (verde),
registrar el ingreso y verlo en la pestaña de hoy. Probá en celular: Portería
lo va a usar desde un teléfono. `npm run lint` y `npx tsc --noEmit`.
```

---

## Prompt 6 — Empleados, disciplinas, reportes y configuración

```
Etapa 6: los módulos de apoyo.

1. Empleados (`/sistema/empleados`), `employees-view.tsx`: tabla con nombre,
   puesto, área, tipo de contratación, horario, estado y contacto; filtros por
   puesto y estado; al tocar una fila se despliega el legajo (fecha de
   ingreso, DNI, email, disciplina a cargo, notas). Contador por puesto arriba.
2. Disciplinas (`/sistema/disciplinas`), `disciplines-view.tsx`: una tarjeta
   por disciplina con la foto de la landing, inscriptos activos, cuota
   mensual, horario, responsable y teléfono; al tocar se abre la lista de
   inscriptos con su estado de cuota. Total de inscriptos y de ingresos
   mensuales por disciplinas.
3. Reportes (`/sistema/reportes`), `reports-view.tsx` + `use-report-data.ts`:
   recaudación por mes (barras), morosidad por categoría, altas y bajas por
   mes, socios por disciplina (barras horizontales), medios de pago. Todo en
   SVG inline, sin librerías, con leyendas y valores legibles; leé la skill
   `dataviz` antes si está disponible. Botón "Exportar a Excel" que descarga
   un CSV del reporte visible.
4. Configuración (`/sistema/configuracion`), `settings-view.tsx`: cuotas por
   categoría y plan (tabla editable en el estado, sin persistir), recargo por
   mora y día de vencimiento, medios de pago habilitados, usuarios con rol y
   último acceso, e "Integraciones" con tarjetas de Mercado Pago, WhatsApp,
   email, facturación electrónica y backups marcadas como "Próximamente", con
   una línea que explique qué resolvería cada una.

`npm run lint` y `npx tsc --noEmit` en verde, y verificación en el navegador
de las cuatro pantallas en escritorio y celular.
```

---

## Prompt 7 — Verificación final y pruebas e2e

```
Etapa final: dejar la demo lista para mostrar.

1. Escribí `e2e/sistema.spec.ts` siguiendo `e2e/helpers.ts` y
   `e2e/pages.spec.ts`: `/sistema` redirige al login sin sesión; el login con
   credenciales malas muestra el error; con `secretaria` / `matheu2026` entra y
   el inicio carga sin errores de consola; el listado de socios filtra por
   DNI; registrar un cobro deja al socio al día; el control de ingreso
   responde habilitado y no habilitado; `/sistema/socios/no-existe` devuelve
   404. Importá los datos de prueba en vez de duplicar valores.
2. Corré `npm run lint`, `npx tsc --noEmit`, `npm run format` y
   `npm run test:e2e` (los dos proyectos). Arreglá lo que falle.
3. Recorré toda la demo en el navegador como si fueras la secretaria del club
   y anotá en `docs/sistema/guion-demo.md` un guion de 10 minutos: en qué
   orden mostrar las pantallas, qué socio buscar, qué cobro registrar, qué DNI
   probar en portería, y la frase de cierre con las integraciones futuras.
4. Mostrame capturas de inicio, socios, cobranza y control de ingreso en
   escritorio y celular.

No commitees: cuando esté todo verde te paso el OK para el commit con
Conventional Commits (`feat: agregar la demo del sistema de gestión`).
```

---

---

## Después del OK del club

### Prompt C — Conectar el front a la API

Va después del OK del club; el front se queda en este repo.

```
Conectá `/sistema` de la landing con la API real (`LumarSoft/fda-api`),
reemplazando los datos de prueba en memoria:

- Servicios en `app/_services/sistema/*.service.ts` (uno por dominio) con
  tipos de request y response en `app/_types/`, sin `fetch` en componentes
  ni hooks, parseando las respuestas como `unknown`.
- Lecturas en Server Components con el caché de Next 16 (`cacheLife`,
  `cacheTag`) y mutaciones con Server Actions que llaman a la API y
  revalidan con `updateTag`.
- Login real contra `/auth/login`, cookie httpOnly con el JWT, roles desde la
  API.
- Mantener los datos de prueba solo para los tests e2e (variable de entorno
  que apunta a una API de pruebas con el seed).
- Variables de entorno documentadas en `README.md`.
```
