# Guion de la demo del sistema (10 minutos)

Para mostrarle al club la demo de `/sistema`. Los socios y DNI de abajo salen
de los datos de prueba, que son siempre los mismos: la demo arranca igual en
cada carga y **recargar la página vuelve todo al estado inicial** (conviene
recargar antes de cada presentación). La fecha de "hoy" está fija en el
11/11/2026.

Tené abiertas dos pestañas o dos dispositivos: la compu con el usuario de
Secretaría y, si se puede, un celular con el de Portería. Las cuatro cuentas
usan la clave `matheu2026`.

## 0. Arranque (30 s)

- Frase de entrada: "Hoy el sistema solo anda en algunas compus. Este entra
  desde cualquier lado, también desde el celular."
- Abrí `/sistema`: sin sesión te lleva al login. Mostrá los botones de las
  cuentas de demo y explicá que cada rol ve solo lo suyo.
- Entrá con **secretaria**.

## 1. Inicio (1 min 30 s)

- "Abrís y ya sabés cómo viene el mes": socios activos, porcentaje al día,
  cobrado y pendiente de noviembre, carnets de pileta pedidos.
- **Para hoy**: los morosos a contactar con su botón de WhatsApp (abre el
  mensaje ya escrito con el nombre y el monto), los aptos médicos que vencen
  en 30 días y los cumpleaños de la semana.
- La recaudación por mes del año y los últimos cobros.

## 2. Socios y cobro (2 min)

- En el buscador de arriba tipeá el DNI **32744927**: aparece **Federico
  Gómez** (socio n.º 882, grupo familiar), el que más debe. "Buscás por DNI y
  tenés todo."
- En la ficha: datos, grupo familiar, disciplinas, pileta y el estado de
  cuenta con las cuotas vencidas en rojo. Badge **Moroso**.
- **Registrar cobro**: vienen tildadas las cuotas vencidas, se suma solo el
  recargo por mora del 10 % y se elige el medio de pago. Confirmá.
- El badge pasa a **Al día** al instante. Abrí el recibo desde el estado de
  cuenta: numerado (`0001-0000…`), con los datos del club, el detalle y quién
  lo cobró. Mostrá **Imprimir** (vista previa sin menú).

## 3. Cobranza (1 min 30 s)

- Período noviembre 2026: esperado, cobrado, pendiente y porcentaje cobrado.
  El cobro de recién ya se ve en los números.
- Pestañas **Pendientes**, **Cobradas** y **Morosos** (ordenados por deuda,
  con cuántos meses deben y desde cuándo).
- Botón **WhatsApp** de un moroso: "El recordatorio sale con un clic, sin
  copiar y pegar nada."
- **Registrar cobro** general: buscás al socio desde el mismo modal.

## 4. Temporada y portería (2 min 30 s)

Mejor desde el celular, con el usuario **porteria**: mostrá que solo ve
Inicio, Socios, Grupos familiares, Temporada y Disciplinas.

- **Control de ingreso**, "Portería tipea el DNI y ve verde o rojo":
  - **31405830** (Valentino Ríos): **HABILITADO**. Registrá el ingreso.
  - **5551247** (Martina Álvarez): **NO HABILITADO**, "Apto médico vencido el
    09/02/2026". Cargá el apto con **Cargar apto médico**, volvé a buscar el
    DNI y queda en verde.
  - **38239717** (Hernán Ramírez): rojo por **cuota vencida desde Octubre
    2026**. Portería no cobra: lo manda a Secretaría (con el usuario de
    Secretaría aparece el atajo **Registrar cobro** ahí mismo).
  - **40123456**: no es socio. Ofrece la entrada como visitante con los
    precios de la landing (con el usuario de Secretaría ofrece también el
    alta).
- **Ingresos de hoy**: los que entraron y los que no, con el motivo.
- **Carnets**: carnets emitidos, pagos y pendientes, y quién no tiene apto.
  Por ejemplo **35930933** (Diego Galli) tiene el carnet sin pagar.

## 5. Grupos familiares (45 s)

- "El plan familiar se cobra una sola vez, al titular": titular, plan,
  integrantes con su edad y la cuota del grupo.
- Mostrá el aviso de los grupos cuyo plan no coincide con la edad de los
  hijos (siguen en básico con chicos de más de 5 años): plata que hoy se
  pierde sin que nadie lo note.

## 6. Reportes y configuración (1 min)

Salí y entrá con **admin**.

- **Reportes**: recaudación por mes, morosidad por categoría, altas y bajas,
  socios por disciplina y medios de pago. **Exportar a Excel** baja el
  reporte en CSV. "Números para la comisión."
- **Configuración**: cambiá el valor de una cuota o el recargo por mora.
  "Lo cambia el club, sin programador." Mostrá usuarios y roles.

## 7. Cierre (30 s)

> "Esto es una demo con datos de prueba, pero los flujos son los del sistema
> real. Lo que sigue, si les sirve: migramos sus socios del sistema actual,
> y después sumamos el link de pago de Mercado Pago para que la cuota se
> marque paga sola, los recordatorios automáticos por WhatsApp, el portal
> para que cada socio vea su deuda y baje sus recibos, y las reservas de
> quinchos y salón."

Las tarjetas de **Integraciones** en Configuración (Mercado Pago, WhatsApp,
email, facturación electrónica, backups) sirven de apoyo para esa frase. Las
fases del presupuesto están en `propuesta.md`, sección 8.
