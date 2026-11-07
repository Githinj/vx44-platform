import Link from "next/link";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { formatAddress, placeholders } from "@/content/site";
import type { LegalContent } from "./types";

// Portuguese (Brazil) translation of the legal pages. AI-drafted and pending legal review
// (SEC-256); the English version governs.

export const legal: LegalContent = {
  privacy: () => (
    <>
      <p>
        Esta política explica como {placeholders.legalEntity} (&quot;nós&quot;) trata informações
        pessoais quando você usa o vx44ai.com e o nosso serviço de monitoramento.
      </p>

      <h2>O que coletamos</h2>
      <ul>
        <li>
          <strong>Pedidos de demonstração:</strong> seu nome, empresa, e-mail, telefone, cidade,
          estado, número aproximado de câmeras, marca do DVR, se você sabe a senha de administrador do
          DVR e sua mensagem. Não pedimos a senha em si.
        </li>
        <li>
          <strong>Agendamentos de demonstração:</strong> quando você agenda um horário, seu nome,
          e-mail, o horário escolhido e o que você incluir no agendamento. Um provedor de agendamento
          cuida da reserva para nós.
        </li>
        <li>
          <strong>Contas de clientes:</strong> dados de contato e de cobrança, endereços dos locais,
          número de câmeras e situação do serviço.
        </li>
        <li>
          <strong>Vídeos:</strong> para clientes, os vídeos das câmeras conectadas ao serviço.
        </li>
        <li>
          <strong>Dados técnicos:</strong> seu endereço IP, usado para proteção contra bots e para
          limitar envios repetidos de formulários. Guardamos apenas uma forma embaralhada (hash) dele
          para esse controle, e a excluímos em cerca de um dia.
        </li>
      </ul>

      <h2>Como usamos</h2>
      <p>
        Usamos essas informações para responder ao seu pedido, verificar a compatibilidade do sistema,
        prestar o serviço e o suporte, enviar mensagens sobre o serviço e proteger nosso site contra
        abusos. Não vendemos suas informações pessoais.
      </p>

      <h2>Suboperadores</h2>
      <p>
        Os vídeos são armazenados por um provedor confiável de armazenamento de vídeo em nuvem que atua
        como nosso suboperador. Não operamos data centers próprios. Também usamos prestadores de
        serviço para hospedagem do site, hospedagem do banco de dados, envio de e-mails, agendamento de
        reuniões e proteção contra bots. Eles tratam os dados em nosso nome, apenas no necessário para
        prestar esses serviços.
      </p>

      <h2>Retenção</h2>
      <p>
        Guardamos os dados dos pedidos de demonstração por {placeholders.retentionPeriod}, e os
        registros das contas de clientes enquanto o serviço estiver ativo e, depois, pelo tempo exigido
        por obrigações legais e contábeis. Os vídeos ficam guardados pelo período de gravação do seu
        plano.
      </p>

      <h2>Suas escolhas</h2>
      <p>
        Você pode pedir para acessar, corrigir ou excluir suas informações pessoais usando os contatos
        abaixo. Talvez precisemos manter alguns registros quando a lei exigir.
      </p>

      <h2>Segurança</h2>
      <p>
        Protegemos as informações com criptografia em trânsito e controles de acesso que as limitam a
        pessoas autorizadas. Nenhum serviço on-line pode garantir segurança absoluta.
      </p>

      <h2>Contato</h2>
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
      <p className="text-muted">Data de vigência: {placeholders.termsEffectiveDate}</p>

      <h2>1. Aceitação dos termos</h2>
      <p>Boas-vindas à VX44 AI Monitoring (“VX44”, “nós” ou “nosso”).</p>
      <p>
        Ao acessar nosso site ou contratar nossos serviços, você concorda com estes Termos e Condições e
        com qualquer contrato de serviço aplicável.
      </p>
      <p>
        Estes Termos regem o uso do nosso site, dos serviços de monitoramento de segurança e do suporte
        operacional relacionado.
      </p>

      <h2>2. Nossos serviços</h2>
      <p>
        A VX44 AI Monitoring oferece soluções profissionais de monitoramento de segurança que combinam
        inteligência artificial avançada com equipe humana de monitoramento treinada.
      </p>
      <p>Dependendo do pacote escolhido, os serviços podem incluir:</p>
      <ul>
        <li>Monitoramento de vídeo com IA.</li>
        <li>Monitoramento humano e revisão das atividades de segurança.</li>
        <li>Identificação de atividades suspeitas e avaliação de alertas.</li>
        <li>Notificação e escalonamento de incidentes.</li>
        <li>Coordenação de acionamento e resposta.</li>
        <li>Operações de monitoramento e atendimento ao cliente.</li>
        <li>Relatórios de atividades de segurança, quando previstos no contrato de serviço.</li>
      </ul>
      <p>
        A cobertura do serviço, o horário de operação, os procedimentos de resposta e as
        responsabilidades específicas são definidos no contrato de serviço de cada cliente.
      </p>

      <h2>3. Tecnologia de IA e monitoramento humano</h2>
      <p>A VX44 combina tecnologia de monitoramento inteligente com profissionais de monitoramento treinados.</p>
      <p>
        Nossos sistemas ajudam a identificar possíveis ameaças, enquanto a equipe de monitoramento
        autorizada analisa os eventos relevantes e coordena as ações adequadas.
      </p>
      <p>
        Essa abordagem combinada busca melhorar a percepção de segurança, a avaliação de incidentes e a
        resposta operacional.
      </p>
      <p>
        Embora a VX44 se esforce para oferecer serviços de monitoramento confiáveis e profissionais,
        nenhum sistema de segurança consegue detectar todos os eventos ou evitar todos os incidentes.
      </p>
      <p>Podem ocorrer alertas falsos, eventos não detectados, interrupções técnicas e erros humanos.</p>
      <p>
        A VX44 não garante a prevenção de furtos, violência, acesso não autorizado, danos materiais ou
        outros incidentes de segurança.
      </p>

      <h2>4. Acionamento e escalonamento de incidentes</h2>
      <p>
        Quando previsto no pacote do cliente, a VX44 coordena notificações e escalonamento de
        incidentes conforme os procedimentos de monitoramento estabelecidos.
      </p>
      <p>
        Esses procedimentos podem incluir o contato com representantes designados pelo cliente, equipe
        de segurança autorizada ou serviços de emergência, quando apropriado.
      </p>
      <p>A coordenação do acionamento não garante tempo de chegada nem resultado específicos.</p>
      <p>A VX44 não substitui os serviços públicos de emergência.</p>

      <h2>5. Privacidade do cliente e confidencialidade empresarial</h2>
      <p>
        A VX44 reconhece que os clientes podem ter negócios com informações sensíveis, privadas,
        proprietárias e confidenciais.
      </p>
      <p>
        Temos o compromisso de proteger a confidencialidade das informações dos clientes e de manter
        práticas profissionais de segurança.
      </p>
      <p>As informações do cliente podem incluir:</p>
      <ul>
        <li>Operações do negócio e atividades internas.</li>
        <li>Imagens das câmeras de segurança e informações de monitoramento.</li>
        <li>Atividade de funcionários e clientes visível por meio do monitoramento autorizado.</li>
        <li>Informações de contato da empresa.</li>
        <li>Procedimentos de segurança e instruções operacionais.</li>
        <li>Informações de pagamento e de gestão da conta.</li>
      </ul>
      <p>
        A VX44 usará as informações do cliente apenas para fins comerciais e de serviço autorizados,
        observada a legislação aplicável.
      </p>
      <p>
        As informações do cliente não devem ser usadas para fins pessoais, comerciais ou alheios ao
        serviço sem autorização.
      </p>

      <h2>6. Confidencialidade e acesso restrito</h2>
      <p>
        A VX44 mantém uma política de acesso restrito aos sistemas de monitoramento e às informações
        comerciais dos clientes.
      </p>
      <p>Por essa política:</p>
      <ul>
        <li>Somente pessoal autorizado pode acessar as informações necessárias às suas funções.</li>
        <li>A equipe de monitoramento deve respeitar a confidencialidade do cliente.</li>
        <li>É proibido visualizar, copiar, compartilhar ou divulgar informações de clientes sem autorização.</li>
        <li>O acesso ao monitoramento de clientes deve ser restrito conforme as permissões atribuídas.</li>
        <li>As informações de um cliente não devem ser divulgadas a outros clientes.</li>
        <li>O pessoal com acesso a informações confidenciais está sujeito às obrigações de confidencialidade aplicáveis.</li>
        <li>As permissões de acesso podem ser revistas, restringidas ou revogadas quando não forem mais necessárias.</li>
      </ul>
      <p>
        O acesso ou a divulgação podem ocorrer quando autorizados pelo cliente, quando necessários para
        prestar os serviços contratados ou quando exigidos ou permitidos pela legislação aplicável.
      </p>

      <h2>7. Separação das contas de clientes</h2>
      <p>A VX44 se compromete a manter a separação adequada entre as contas de clientes e o acesso ao monitoramento.</p>
      <p>Cada cliente deve poder acessar apenas as informações e os serviços autorizados para a sua conta.</p>
      <p>Os clientes não podem acessar, de outro cliente:</p>
      <ul>
        <li>Imagens das câmeras.</li>
        <li>Informações de monitoramento de segurança.</li>
        <li>Informações de gestão do negócio.</li>
        <li>Registros de conta ou de cobrança.</li>
        <li>Informações operacionais confidenciais.</li>
      </ul>
      <p>São estritamente proibidas tentativas não autorizadas de acessar sistemas ou informações de outro cliente.</p>

      <h2>8. Segurança da informação</h2>
      <p>
        A VX44 busca adotar salvaguardas administrativas, técnicas e organizacionais adequadas para
        proteger as informações sob sua responsabilidade.
      </p>
      <p>
        As práticas de segurança podem incluir controles de acesso, autenticação, procedimentos de
        autorização de pessoal e supervisão operacional.
      </p>
      <p>
        Os clientes são responsáveis por manter a confidencialidade das próprias credenciais e por
        comunicar prontamente qualquer suspeita de acesso não autorizado.
      </p>
      <p>Nenhum sistema eletrônico ou procedimento de segurança pode ser garantido como totalmente seguro.</p>

      <h2>9. Responsabilidades do cliente</h2>
      <p>Os clientes concordam em:</p>
      <ul>
        <li>Manter equipamentos de segurança compatíveis e funcionando corretamente, salvo acordo em contrário.</li>
        <li>Fornecer energia elétrica e conexão de internet confiáveis.</li>
        <li>Manter atualizadas as informações de contato de emergência.</li>
        <li>Fornecer o acesso autorizado necessário aos serviços de monitoramento.</li>
        <li>Informar a VX44 sobre mudanças que afetem as operações de segurança.</li>
        <li>Obter os avisos, permissões e consentimentos de videomonitoramento exigidos por lei.</li>
        <li>Cumprir as leis aplicáveis de privacidade, trabalho e videomonitoramento.</li>
        <li>Proteger suas credenciais contra uso não autorizado.</li>
      </ul>

      <h2>10. Disponibilidade do serviço</h2>
      <p>
        A VX44 presta os serviços de monitoramento conforme o horário de cobertura e os níveis de
        serviço previstos no contrato aplicável.
      </p>
      <p>
        Podem ocorrer interrupções por falhas de equipamento, quedas de internet, falta de energia,
        manutenção ou outras circunstâncias operacionais.
      </p>
      <p>Qualquer compromisso específico de disponibilidade ou de tempo de resposta deve ser estabelecido expressamente por escrito.</p>

      <h2>11. Pagamentos e assinaturas</h2>
      <p>
        Preços, taxas de ativação, calendário de cobrança e obrigações de pagamento constarão do pedido
        ou do contrato de serviço aplicável.
      </p>
      <p>Os clientes concordam em pagar as cobranças autorizadas relativas aos serviços escolhidos.</p>
      <p>
        Saldos em atraso ou não pagos podem resultar em restrição ou suspensão do serviço, conforme
        permitido pela legislação aplicável e pelo contrato vigente.
      </p>

      <h2>12. Cancelamento e rescisão</h2>
      <p>
        Procedimentos de cancelamento, prazos de aviso, reembolsos e eventuais multas por rescisão
        antecipada serão regidos pelo contrato de serviço aplicável.
      </p>
      <p>
        A VX44 pode suspender ou encerrar os serviços em caso de violação relevante das obrigações
        contratuais, observadas a legislação aplicável e as condições do contrato.
      </p>

      <h2>13. Privacidade e proteção de dados</h2>
      <p>
        A VX44 mantém o histórico de pagamentos e as informações administrativas gerais necessárias à
        gestão das contas e dos serviços dos clientes.
      </p>
      <p>
        As gravações de vídeo dos clientes não são armazenadas de forma independente na plataforma
        interna de gestão da VX44.
      </p>
      <p>O acesso às informações de monitoramento é limitado a fins operacionais autorizados.</p>
      <p>
        As informações pessoais são tratadas de acordo com a nossa{" "}
        <Link href="/pt/privacy" className="underline underline-offset-4 hover:text-gold">
          Política de privacidade
        </Link>{" "}
        e com os requisitos legais aplicáveis.
      </p>

      <h2>14. Limitação de responsabilidade</h2>
      <p>
        A VX44 presta serviços de monitoramento e coordenação destinados a melhorar a percepção de
        segurança e apoiar a resposta a incidentes.
      </p>
      <p>
        Esses serviços não são seguro e não garantem a prevenção de perdas financeiras, atividades
        criminosas, danos materiais ou lesões pessoais.
      </p>
      <p>
        Quaisquer limitações contratuais de responsabilidade serão regidas pelo contrato de serviço
        aplicável e só valerão na medida permitida por lei.
      </p>
      <p>Nada nestes Termos exclui ou limita responsabilidades que não possam ser legalmente excluídas ou limitadas.</p>

      <h2>15. Propriedade intelectual</h2>
      <p>
        O nome VX44 AI Monitoring, a marca, o conteúdo do site, as interfaces de software e os materiais
        proprietários são protegidos pelas leis de propriedade intelectual aplicáveis.
      </p>
      <p>
        É proibido copiar, modificar, distribuir ou usar comercialmente sem autorização, exceto quando
        permitido por lei ou por autorização por escrito.
      </p>

      <h2>16. Alterações nos termos</h2>
      <p>
        A VX44 pode atualizar estes Termos e Condições para refletir mudanças nos serviços, nas operações
        ou nos requisitos legais aplicáveis.
      </p>
      <p>
        Alterações relevantes que afetem serviços já contratados serão tratadas conforme os contratos
        aplicáveis e a lei.
      </p>

      <h2>17. Lei aplicável</h2>
      <p>
        Estes Termos são regidos pelas leis de {placeholders.governingLaw}, ressalvadas as proteções
        legais obrigatórias aplicáveis.
      </p>
      <p>Quaisquer procedimentos de solução de controvérsias acordados separadamente se aplicarão quando legalmente exigíveis.</p>

      <h2>18. Informações de contato</h2>
      <p>
        VX44 AI Monitoring
        <br />
        Site:{" "}
        <a href="https://vx44ai.com" className="underline-offset-4 hover:text-gold hover:underline">
          https://vx44ai.com
        </a>
        <br />
        E-mail: <EmailLink />
        <br />
        Razão social: {placeholders.legalEntity}
        <br />
        Endereço comercial: {formatAddress()}
      </p>
      <p>Em caso de dúvidas sobre estes Termos e Condições, entre em contato por e-mail.</p>
    </>
  ),
};
