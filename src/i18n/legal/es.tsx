import Link from "next/link";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { formatAddress, placeholders } from "@/content/site";
import type { LegalContent } from "./types";

// Spanish translation of the legal pages. AI-drafted and pending legal review (SEC-256);
// the English version governs.

export const legal: LegalContent = {
  privacy: () => (
    <>
      <p>
        Esta política explica cómo {placeholders.legalEntity} (&quot;nosotros&quot;) trata la
        información personal cuando usted usa vx44ai.com y nuestro servicio de monitoreo.
      </p>

      <h2>Qué recopilamos</h2>
      <ul>
        <li>
          <strong>Solicitudes de demostración:</strong> su nombre, negocio, correo electrónico,
          teléfono, ciudad, estado, cantidad aproximada de cámaras, marca del DVR, si sabe la
          contraseña de administrador del DVR y su mensaje. No pedimos la contraseña en sí.
        </li>
        <li>
          <strong>Reservas de demostración:</strong> cuando reserva un horario, su nombre, correo
          electrónico, el horario elegido y lo que agregue a la reserva. Un proveedor de agendamiento
          gestiona la reserva por nosotros.
        </li>
        <li>
          <strong>Cuentas de clientes:</strong> datos de contacto y facturación, direcciones de los
          locales, cantidad de cámaras y estado del servicio.
        </li>
        <li>
          <strong>Video:</strong> para los clientes, el video de las cámaras conectadas al servicio.
        </li>
        <li>
          <strong>Datos técnicos:</strong> su dirección IP, que usamos para la protección contra bots
          y para limitar envíos repetidos de formularios. Para limitar envíos solo guardamos una forma
          cifrada (hash) de ella, y la eliminamos en aproximadamente un día.
        </li>
      </ul>

      <h2>Cómo la usamos</h2>
      <p>
        Usamos esta información para responder a su solicitud, comprobar la compatibilidad del
        sistema, prestar el servicio y darle soporte, enviar mensajes sobre el servicio y proteger
        nuestro sitio contra abusos. No vendemos su información personal.
      </p>

      <h2>Subencargados</h2>
      <p>
        El video lo almacena un proveedor de confianza de almacenamiento de video en la nube que actúa
        como nuestro subencargado. No operamos centros de datos propios. También usamos proveedores de
        servicios para el alojamiento del sitio web, el alojamiento de la base de datos, el envío de
        correos, la programación de reuniones y la protección contra bots. Tratan los datos en nuestro
        nombre y solo en la medida necesaria para prestar esos servicios.
      </p>

      <h2>Conservación</h2>
      <p>
        Conservamos los datos de las solicitudes de demostración durante{" "}
        {placeholders.retentionPeriod}, y los registros de las cuentas de clientes mientras el servicio
        esté activo y, después, durante el tiempo que exijan las obligaciones legales y contables. El
        video se conserva durante el período de grabación de su plan.
      </p>

      <h2>Sus opciones</h2>
      <p>
        Puede pedirnos acceder a su información personal, corregirla o eliminarla usando los datos de
        contacto que figuran abajo. Es posible que debamos conservar algunos registros cuando la ley lo
        exija.
      </p>

      <h2>Seguridad</h2>
      <p>
        Protegemos la información con cifrado en tránsito y controles de acceso que la limitan a
        personas autorizadas. Ningún servicio en línea puede garantizar una seguridad absoluta.
      </p>

      <h2>Contacto</h2>
      <p>
        {placeholders.legalEntity}
        <br />
        <EmailLink />
        <br />
        <PhoneLink />
      </p>
    </>
  ),

  terms: () => (
    <>
      <p className="text-muted">Fecha de entrada en vigor: {placeholders.termsEffectiveDate}</p>

      <h2>1. Aceptación de los términos</h2>
      <p>Bienvenido a VX44 AI Monitoring (“VX44”, “nosotros” o “nuestro”).</p>
      <p>
        Al acceder a nuestro sitio web o suscribirse a nuestros servicios, usted acepta estos Términos
        y Condiciones y cualquier acuerdo de servicio al cliente aplicable.
      </p>
      <p>
        Estos Términos rigen el uso de nuestro sitio web, de nuestros servicios de monitoreo de
        seguridad y del soporte operativo relacionado.
      </p>

      <h2>2. Nuestros servicios</h2>
      <p>
        VX44 AI Monitoring ofrece soluciones profesionales de monitoreo de seguridad que combinan
        inteligencia artificial avanzada con personal de monitoreo humano capacitado.
      </p>
      <p>Según el paquete de servicio elegido, los servicios pueden incluir:</p>
      <ul>
        <li>Monitoreo de video con IA.</li>
        <li>Monitoreo humano y revisión de la actividad de seguridad.</li>
        <li>Identificación de actividad sospechosa y evaluación de alertas.</li>
        <li>Notificación y escalamiento de incidentes.</li>
        <li>Coordinación de despacho y respuesta.</li>
        <li>Operaciones de monitoreo y atención al cliente.</li>
        <li>Informes de actividad de seguridad, cuando estén incluidos en el acuerdo de servicio.</li>
      </ul>
      <p>
        La cobertura del servicio, el horario de operación, los procedimientos de respuesta y las
        responsabilidades específicas se establecen en el acuerdo de servicio de cada cliente.
      </p>

      <h2>3. Tecnología de IA y monitoreo humano</h2>
      <p>
        VX44 combina tecnología de monitoreo inteligente con profesionales de monitoreo humano
        capacitados.
      </p>
      <p>
        Nuestros sistemas ayudan a identificar posibles amenazas de seguridad, mientras que el
        personal de monitoreo autorizado revisa los eventos relevantes y coordina las acciones
        apropiadas.
      </p>
      <p>
        Este enfoque combinado busca mejorar la conciencia de seguridad, la evaluación de incidentes y
        la respuesta operativa.
      </p>
      <p>
        Aunque VX44 se esfuerza por prestar servicios de monitoreo fiables y profesionales, ningún
        sistema de seguridad puede detectar todos los eventos ni prevenir todos los incidentes.
      </p>
      <p>Pueden producirse falsas alertas, eventos no detectados, interrupciones técnicas y errores humanos.</p>
      <p>
        VX44 no garantiza la prevención de robos, violencia, accesos no autorizados, daños a la
        propiedad ni otros incidentes de seguridad.
      </p>

      <h2>4. Despacho y escalamiento de incidentes</h2>
      <p>
        Cuando esté incluido en el paquete de servicio del cliente, VX44 coordina las notificaciones y
        el escalamiento de incidentes según los procedimientos de monitoreo establecidos.
      </p>
      <p>
        Estos procedimientos pueden incluir contactar a los representantes designados del cliente, al
        personal de seguridad autorizado o a los servicios de emergencia cuando corresponda.
      </p>
      <p>La coordinación del despacho no garantiza un tiempo de llegada ni un resultado específicos.</p>
      <p>VX44 no reemplaza a los servicios públicos de emergencia.</p>

      <h2>5. Privacidad del cliente y confidencialidad empresarial</h2>
      <p>
        VX44 reconoce que los clientes pueden operar negocios que contienen información sensible,
        privada, de su propiedad y confidencial.
      </p>
      <p>
        Nos comprometemos a proteger la confidencialidad de la información de los clientes y a mantener
        prácticas de seguridad profesionales.
      </p>
      <p>La información del cliente puede incluir:</p>
      <ul>
        <li>Operaciones del negocio y actividades internas.</li>
        <li>Vistas de las cámaras de seguridad e información de monitoreo.</li>
        <li>Actividad de empleados y clientes visible mediante el monitoreo autorizado.</li>
        <li>Información de contacto del negocio.</li>
        <li>Procedimientos de seguridad e instrucciones operativas.</li>
        <li>Información de pagos y de gestión de la cuenta.</li>
      </ul>
      <p>
        VX44 usará la información del cliente solo para fines comerciales y relacionados con el
        servicio que estén autorizados, con sujeción a la legislación aplicable.
      </p>
      <p>
        La información del cliente no debe usarse para fines personales, comerciales o ajenos que no
        estén autorizados.
      </p>

      <h2>6. Confidencialidad y acceso restringido</h2>
      <p>
        VX44 mantiene una política de acceso restringido a los sistemas de monitoreo y a la información
        comercial de los clientes.
      </p>
      <p>Según esta política:</p>
      <ul>
        <li>Solo el personal autorizado puede acceder a la información necesaria para sus responsabilidades asignadas.</li>
        <li>El personal de monitoreo debe respetar la confidencialidad del cliente.</li>
        <li>Se prohíbe ver, copiar, compartir o divulgar sin autorización la información de los clientes.</li>
        <li>El acceso al monitoreo de los clientes debe restringirse según los permisos asignados.</li>
        <li>La información de un cliente no debe divulgarse a otros clientes no relacionados.</li>
        <li>El personal con acceso a información confidencial está sujeto a las obligaciones de confidencialidad aplicables.</li>
        <li>Los permisos de acceso pueden revisarse, restringirse o revocarse cuando dejen de ser necesarios.</li>
      </ul>
      <p>
        El acceso o la divulgación pueden darse cuando el cliente lo autorice, cuando sea necesario para
        prestar los servicios contratados o cuando la legislación aplicable lo exija o permita.
      </p>

      <h2>7. Separación de las cuentas de clientes</h2>
      <p>
        VX44 se compromete a mantener una separación adecuada entre las cuentas de los clientes y el
        acceso al monitoreo.
      </p>
      <p>Cada cliente debe poder acceder solo a la información y los servicios autorizados para su cuenta.</p>
      <p>Los clientes no pueden acceder a lo siguiente de otro cliente:</p>
      <ul>
        <li>Transmisiones de cámaras.</li>
        <li>Información de monitoreo de seguridad.</li>
        <li>Información de gestión del negocio.</li>
        <li>Registros de cuenta o de facturación.</li>
        <li>Información operativa confidencial.</li>
      </ul>
      <p>
        Se prohíben estrictamente los intentos no autorizados de acceder a los sistemas o a la
        información de otro cliente.
      </p>

      <h2>8. Seguridad de la información</h2>
      <p>
        VX44 procura aplicar medidas administrativas, técnicas y organizativas adecuadas para proteger
        la información bajo su responsabilidad.
      </p>
      <p>
        Las prácticas de seguridad pueden incluir controles de acceso, autenticación, procedimientos de
        autorización del personal y supervisión operativa.
      </p>
      <p>
        Los clientes son responsables de mantener la confidencialidad de sus credenciales de cuenta y de
        informar con prontitud cualquier sospecha de acceso no autorizado.
      </p>
      <p>No se puede garantizar que ningún sistema electrónico ni procedimiento de seguridad sea completamente seguro.</p>

      <h2>9. Responsabilidades del cliente</h2>
      <p>Los clientes se comprometen a:</p>
      <ul>
        <li>Mantener equipos de seguridad compatibles y en buen funcionamiento, salvo que se acuerde otra cosa.</li>
        <li>Proporcionar energía eléctrica y conexión a internet fiables.</li>
        <li>Mantener actualizada la información de contacto de emergencia.</li>
        <li>Proporcionar el acceso autorizado necesario para los servicios de monitoreo.</li>
        <li>Informar a VX44 de los cambios que afecten a las operaciones de seguridad.</li>
        <li>Obtener los avisos, permisos y consentimientos de videovigilancia exigidos por la ley.</li>
        <li>Cumplir la legislación aplicable en materia de privacidad, empleo y videovigilancia.</li>
        <li>Proteger sus credenciales de cuenta contra el uso no autorizado.</li>
      </ul>

      <h2>10. Disponibilidad del servicio</h2>
      <p>
        VX44 presta los servicios de monitoreo según el horario de cobertura y los niveles de servicio
        especificados en el acuerdo con el cliente aplicable.
      </p>
      <p>
        Pueden producirse interrupciones del servicio por fallas de equipos, cortes de internet, cortes
        de energía, mantenimiento u otras circunstancias operativas.
      </p>
      <p>Cualquier compromiso específico de disponibilidad o de tiempo de respuesta debe establecerse expresamente por escrito.</p>

      <h2>11. Pagos y suscripciones</h2>
      <p>
        Los precios del servicio, las tarifas de activación, los calendarios de facturación y las
        obligaciones de pago se indicarán en el pedido o en el acuerdo de servicio al cliente aplicable.
      </p>
      <p>Los clientes se comprometen a pagar los cargos autorizados asociados a los servicios elegidos.</p>
      <p>
        Los saldos atrasados o impagos pueden dar lugar a restricciones o a la suspensión del servicio,
        en la medida en que lo permitan la legislación aplicable y el acuerdo vigente.
      </p>

      <h2>12. Cancelación y terminación</h2>
      <p>
        Los procedimientos de cancelación, los plazos de preaviso, los reembolsos y los posibles cargos
        por terminación anticipada se regirán por el acuerdo de servicio al cliente aplicable.
      </p>
      <p>
        VX44 puede suspender o terminar los servicios por incumplimientos graves de las obligaciones
        contractuales, con sujeción a la legislación aplicable y a los términos del acuerdo.
      </p>

      <h2>13. Privacidad y protección de datos</h2>
      <p>
        VX44 conserva el historial de pagos y la información administrativa general necesarios para la
        gestión de la cuenta y del servicio del cliente.
      </p>
      <p>
        Las grabaciones de video de los clientes no se almacenan de forma independiente en la
        plataforma interna de gestión comercial de VX44.
      </p>
      <p>El acceso a la información de monitoreo se limita a fines operativos autorizados.</p>
      <p>
        La información personal se trata de acuerdo con nuestra{" "}
        <Link href="/es/privacy" className="underline underline-offset-4 hover:text-gold">
          Política de privacidad
        </Link>{" "}
        y con los requisitos legales aplicables.
      </p>

      <h2>14. Limitación de responsabilidad</h2>
      <p>
        VX44 presta servicios de monitoreo y coordinación destinados a mejorar la conciencia de
        seguridad y apoyar la respuesta a incidentes.
      </p>
      <p>
        Estos servicios no son un seguro y no garantizan la prevención de pérdidas económicas,
        actividades delictivas, daños a la propiedad ni lesiones personales.
      </p>
      <p>
        Cualquier limitación contractual de responsabilidad se regirá por el acuerdo de servicio al
        cliente aplicable y solo será exigible en la medida en que la ley lo permita.
      </p>
      <p>Nada en estos Términos excluye ni limita la responsabilidad que legalmente no pueda excluirse ni limitarse.</p>

      <h2>15. Propiedad intelectual</h2>
      <p>
        El nombre VX44 AI Monitoring, su marca, el contenido del sitio web, las interfaces de software y
        los materiales propios están protegidos por la legislación de propiedad intelectual aplicable.
      </p>
      <p>
        Se prohíbe copiar, modificar, distribuir o usar comercialmente estos elementos sin autorización,
        salvo que la ley lo permita o exista una autorización por escrito.
      </p>

      <h2>16. Cambios en los términos</h2>
      <p>
        VX44 puede actualizar estos Términos y Condiciones para reflejar cambios en sus servicios, en sus
        operaciones comerciales o en los requisitos legales aplicables.
      </p>
      <p>
        Los cambios importantes que afecten a servicios contratados vigentes se tratarán conforme a los
        acuerdos aplicables y a la ley.
      </p>

      <h2>17. Legislación aplicable</h2>
      <p>
        Estos Términos se rigen por las leyes de {placeholders.governingLaw}, sin perjuicio de las
        protecciones legales obligatorias aplicables.
      </p>
      <p>Cualquier procedimiento de resolución de disputas acordado por separado se aplicará cuando sea legalmente exigible.</p>

      <h2>18. Información de contacto</h2>
      <p>
        VX44 AI Monitoring
        <br />
        Sitio web:{" "}
        <a href="https://vx44ai.com" className="underline-offset-4 hover:text-gold hover:underline">
          https://vx44ai.com
        </a>
        <br />
        Correo electrónico: <EmailLink />
        <br />
        Razón social: {placeholders.legalEntity}
        <br />
        Dirección comercial: {formatAddress()}
      </p>
      <p>Si tiene preguntas sobre estos Términos y Condiciones, escríbanos por correo electrónico.</p>
    </>
  ),
};
