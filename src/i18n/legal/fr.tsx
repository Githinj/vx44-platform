import Link from "next/link";
import { EmailLink, PhoneLink } from "@/components/marketing/contact-links";
import { formatAddress, placeholders } from "@/content/site";
import type { LegalContent } from "./types";

// French translation of the legal pages. AI-drafted and pending legal review (SEC-256);
// the English version governs.

export const legal: LegalContent = {
  privacy: () => (
    <>
      <p>
        Cette politique explique comment {placeholders.legalEntity} (&quot;nous&quot;) traite les
        informations personnelles lorsque vous utilisez vx44ai.com et notre service de surveillance.
      </p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>
          <strong>Demandes de démo :</strong> votre nom, votre entreprise, votre e-mail, votre
          téléphone, votre ville, votre État, le nombre approximatif de caméras, la marque du DVR, le
          fait que vous connaissiez ou non le mot de passe administrateur du DVR, et votre message.
          Nous ne demandons pas le mot de passe lui-même.
        </li>
        <li>
          <strong>Réservations de démo :</strong> lorsque vous réservez un créneau, votre nom, votre
          e-mail, le créneau choisi et tout ce que vous ajoutez à la réservation. Un prestataire de
          planification gère la réservation pour nous.
        </li>
        <li>
          <strong>Comptes clients :</strong> coordonnées et informations de facturation, adresses des
          sites, nombre de caméras et état du service.
        </li>
        <li>
          <strong>Vidéos :</strong> pour les clients, les vidéos des caméras connectées au service.
        </li>
        <li>
          <strong>Données techniques :</strong> votre adresse IP, utilisée pour la protection contre
          les robots et pour limiter les envois répétés de formulaires. Nous n’en conservons qu’une
          forme brouillée (hachée) pour limiter les envois, et nous la supprimons en un jour environ.
        </li>
      </ul>

      <h2>Comment nous les utilisons</h2>
      <p>
        Nous utilisons ces informations pour répondre à votre demande, vérifier la compatibilité du
        système, fournir le service et l’assistance, envoyer des messages liés au service et protéger
        notre site contre les abus. Nous ne vendons pas vos informations personnelles.
      </p>

      <h2>Sous-traitants</h2>
      <p>
        Les vidéos sont stockées par un prestataire de stockage vidéo cloud de confiance agissant en
        tant que sous-traitant. Nous n’exploitons pas nos propres centres de données. Nous faisons aussi
        appel à des prestataires pour l’hébergement du site, l’hébergement de la base de données,
        l’envoi d’e-mails, la planification de rendez-vous et la protection contre les robots. Ils
        traitent les données pour notre compte, uniquement dans la mesure nécessaire à ces services.
      </p>

      <h2>Conservation</h2>
      <p>
        Nous conservons les informations des demandes de démo pendant {placeholders.retentionPeriod},
        et les dossiers des comptes clients tant que le service est actif, puis aussi longtemps que
        l’exigent les obligations légales et comptables. Les vidéos sont conservées pendant la durée
        d’enregistrement prévue par votre offre.
      </p>

      <h2>Vos choix</h2>
      <p>
        Vous pouvez nous demander d’accéder à vos informations personnelles, de les corriger ou de les
        supprimer en utilisant les coordonnées ci-dessous. Il se peut que nous devions conserver
        certains dossiers lorsque la loi l’exige.
      </p>

      <h2>Sécurité</h2>
      <p>
        Nous protégeons les informations par le chiffrement en transit et par des contrôles d’accès qui
        les réservent aux personnes autorisées. Aucun service en ligne ne peut garantir une sécurité
        absolue.
      </p>

      <h2>Contact</h2>
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
      <p className="text-muted">Date d’entrée en vigueur : {placeholders.termsEffectiveDate}</p>

      <h2>1. Acceptation des conditions</h2>
      <p>Bienvenue chez VX44 AI Monitoring (« VX44 », « nous », « notre » ou « nos »).</p>
      <p>
        En accédant à notre site ou en souscrivant à nos services, vous acceptez les présentes
        Conditions générales et tout contrat de service client applicable.
      </p>
      <p>
        Les présentes Conditions régissent l’utilisation de notre site, de nos services de surveillance
        de sécurité et de l’assistance opérationnelle associée.
      </p>

      <h2>2. Nos services</h2>
      <p>
        VX44 AI Monitoring fournit des solutions professionnelles de surveillance de sécurité associant
        une intelligence artificielle avancée à un personnel de surveillance humain formé.
      </p>
      <p>Selon l’offre choisie, les services peuvent inclure :</p>
      <ul>
        <li>La vidéosurveillance assistée par IA.</li>
        <li>La surveillance humaine et l’examen de l’activité de sécurité.</li>
        <li>L’identification des activités suspectes et l’évaluation des alertes.</li>
        <li>La notification et l’escalade des incidents.</li>
        <li>La coordination des interventions.</li>
        <li>Les opérations de surveillance et le service client.</li>
        <li>Les rapports d’activité de sécurité lorsqu’ils sont prévus au contrat de service.</li>
      </ul>
      <p>
        La couverture du service, les heures de fonctionnement, les procédures d’intervention et les
        responsabilités spécifiques sont définies dans le contrat de service de chaque client.
      </p>

      <h2>3. Technologie d’IA et surveillance humaine</h2>
      <p>
        VX44 associe une technologie de surveillance intelligente à des professionnels de la
        surveillance humaine formés.
      </p>
      <p>
        Nos systèmes aident à identifier les menaces potentielles, tandis que le personnel de
        surveillance autorisé examine les événements pertinents et coordonne les actions appropriées.
      </p>
      <p>
        Cette approche combinée vise à améliorer la vigilance, l’évaluation des incidents et la réponse
        opérationnelle.
      </p>
      <p>
        Bien que VX44 s’efforce de fournir des services de surveillance fiables et professionnels, aucun
        système de sécurité ne peut détecter tous les événements ni empêcher tous les incidents.
      </p>
      <p>De fausses alertes, des événements manqués, des interruptions techniques et des erreurs humaines peuvent survenir.</p>
      <p>
        VX44 ne garantit pas la prévention des vols, des violences, des accès non autorisés, des dommages
        matériels ou d’autres incidents de sécurité.
      </p>

      <h2>4. Intervention et escalade des incidents</h2>
      <p>
        Lorsque cela est prévu dans l’offre du client, VX44 coordonne la notification et l’escalade des
        incidents selon les procédures de surveillance établies.
      </p>
      <p>
        Ces procédures peuvent inclure le contact avec les représentants désignés du client, le
        personnel de sécurité autorisé ou les services d’urgence lorsque cela est approprié.
      </p>
      <p>La coordination d’une intervention ne garantit ni un délai d’arrivée ni un résultat précis.</p>
      <p>VX44 ne remplace pas les services publics d’urgence.</p>

      <h2>5. Confidentialité des clients et secret des affaires</h2>
      <p>
        VX44 reconnaît que les clients peuvent exploiter des entreprises détenant des informations
        sensibles, privées, exclusives et confidentielles.
      </p>
      <p>
        Nous nous engageons à protéger la confidentialité des informations des clients et à maintenir
        des pratiques de sécurité professionnelles.
      </p>
      <p>Les informations des clients peuvent comprendre :</p>
      <ul>
        <li>Les opérations de l’entreprise et ses activités internes.</li>
        <li>Les vues des caméras de sécurité et les informations de surveillance.</li>
        <li>L’activité des employés et des clients visible par la surveillance autorisée.</li>
        <li>Les coordonnées de l’entreprise.</li>
        <li>Les procédures de sécurité et les consignes opérationnelles.</li>
        <li>Les informations de paiement et de gestion du compte.</li>
      </ul>
      <p>
        VX44 n’utilisera les informations des clients qu’à des fins commerciales et de service
        autorisées, sous réserve de la loi applicable.
      </p>
      <p>
        Les informations des clients ne doivent pas être utilisées à des fins personnelles,
        commerciales ou étrangères au service non autorisées.
      </p>

      <h2>6. Confidentialité et accès restreint</h2>
      <p>
        VX44 applique une politique d’accès restreint aux systèmes de surveillance et aux informations
        commerciales des clients.
      </p>
      <p>Selon cette politique :</p>
      <ul>
        <li>Seul le personnel autorisé peut accéder aux informations nécessaires à ses missions.</li>
        <li>Le personnel de surveillance doit respecter la confidentialité des clients.</li>
        <li>Il est interdit de consulter, copier, partager ou divulguer sans autorisation les informations des clients.</li>
        <li>L’accès à la surveillance des clients doit être limité selon les autorisations attribuées.</li>
        <li>Les informations d’un client ne doivent pas être divulguées à d’autres clients.</li>
        <li>Le personnel ayant accès à des informations confidentielles est soumis aux obligations de confidentialité applicables.</li>
        <li>Les autorisations d’accès peuvent être réexaminées, restreintes ou révoquées lorsqu’elles ne sont plus nécessaires.</li>
      </ul>
      <p>
        Un accès ou une divulgation peut avoir lieu lorsque le client l’autorise, lorsque cela est
        nécessaire à la fourniture des services prévus au contrat, ou lorsque la loi applicable l’exige
        ou le permet.
      </p>

      <h2>7. Séparation des comptes clients</h2>
      <p>
        VX44 s’engage à maintenir une séparation appropriée entre les comptes clients et les accès à la
        surveillance.
      </p>
      <p>Chaque client ne doit pouvoir accéder qu’aux informations et services autorisés pour son compte.</p>
      <p>Les clients ne sont pas autorisés à accéder aux éléments suivants d’un autre client :</p>
      <ul>
        <li>Les flux des caméras.</li>
        <li>Les informations de surveillance de sécurité.</li>
        <li>Les informations de gestion de l’entreprise.</li>
        <li>Les dossiers de compte ou de facturation.</li>
        <li>Les informations opérationnelles confidentielles.</li>
      </ul>
      <p>
        Toute tentative non autorisée d’accéder aux systèmes ou aux informations d’un autre client est
        strictement interdite.
      </p>

      <h2>8. Sécurité de l’information</h2>
      <p>
        VX44 s’efforce de mettre en place des mesures administratives, techniques et organisationnelles
        appropriées pour protéger les informations dont elle est responsable.
      </p>
      <p>
        Les pratiques de sécurité peuvent inclure des contrôles d’accès, l’authentification, des
        procédures d’habilitation du personnel et une supervision opérationnelle.
      </p>
      <p>
        Les clients sont responsables de la confidentialité de leurs identifiants et doivent signaler
        sans délai tout accès non autorisé suspecté.
      </p>
      <p>Aucun système électronique ni aucune procédure de sécurité ne peut être garanti totalement sûr.</p>

      <h2>9. Responsabilités du client</h2>
      <p>Les clients s’engagent à :</p>
      <ul>
        <li>Maintenir un équipement de sécurité compatible et en bon état de fonctionnement, sauf accord contraire.</li>
        <li>Assurer une alimentation électrique et une connexion internet fiables.</li>
        <li>Tenir à jour les coordonnées d’urgence.</li>
        <li>Fournir les accès autorisés nécessaires aux services de surveillance.</li>
        <li>Informer VX44 de tout changement affectant les opérations de sécurité.</li>
        <li>Obtenir les avis, autorisations et consentements de vidéosurveillance exigés par la loi.</li>
        <li>Respecter les lois applicables en matière de vie privée, d’emploi et de vidéosurveillance.</li>
        <li>Protéger leurs identifiants contre toute utilisation non autorisée.</li>
      </ul>

      <h2>10. Disponibilité du service</h2>
      <p>
        VX44 fournit les services de surveillance selon les heures de couverture et les niveaux de service
        prévus au contrat client applicable.
      </p>
      <p>
        Des interruptions de service peuvent résulter de pannes d’équipement, de coupures internet ou
        électriques, de maintenance ou d’autres circonstances opérationnelles.
      </p>
      <p>Tout engagement précis de disponibilité ou de délai d’intervention doit être expressément établi par écrit.</p>

      <h2>11. Paiements et abonnements</h2>
      <p>
        Les tarifs du service, les frais d’activation, le calendrier de facturation et les obligations de
        paiement sont indiqués dans la commande ou le contrat de service client applicable.
      </p>
      <p>Les clients s’engagent à payer les frais autorisés liés aux services choisis.</p>
      <p>
        Les soldes en retard ou impayés peuvent entraîner une restriction ou une suspension du service,
        dans la mesure permise par la loi applicable et le contrat en vigueur.
      </p>

      <h2>12. Résiliation</h2>
      <p>
        Les modalités de résiliation, les préavis, les remboursements et les éventuels frais de
        résiliation anticipée sont régis par le contrat de service client applicable.
      </p>
      <p>
        VX44 peut suspendre ou résilier les services en cas de manquement grave aux obligations
        contractuelles, sous réserve de la loi applicable et des termes du contrat.
      </p>

      <h2>13. Vie privée et protection des données</h2>
      <p>
        VX44 conserve l’historique des paiements et les informations administratives générales
        nécessaires à la gestion des comptes et des services clients.
      </p>
      <p>
        Les enregistrements vidéo des clients ne sont pas stockés de manière indépendante dans la
        plateforme interne de gestion de VX44.
      </p>
      <p>L’accès aux informations de surveillance est limité à des fins opérationnelles autorisées.</p>
      <p>
        Les informations personnelles sont traitées conformément à notre{" "}
        <Link href="/fr/privacy" className="underline underline-offset-4 hover:text-gold">
          Politique de confidentialité
        </Link>{" "}
        et aux exigences légales applicables.
      </p>

      <h2>14. Limitation de responsabilité</h2>
      <p>
        VX44 fournit des services de surveillance et de coordination destinés à améliorer la vigilance et
        à soutenir la réponse aux incidents.
      </p>
      <p>
        Ces services ne constituent pas une assurance et ne garantissent pas la prévention des pertes
        financières, des actes criminels, des dommages matériels ou des préjudices corporels.
      </p>
      <p>
        Toute limitation contractuelle de responsabilité est régie par le contrat de service client
        applicable et n’est opposable que dans la mesure permise par la loi.
      </p>
      <p>Rien dans les présentes Conditions n’exclut ni ne limite une responsabilité qui ne peut légalement être exclue ou limitée.</p>

      <h2>15. Propriété intellectuelle</h2>
      <p>
        Le nom VX44 AI Monitoring, l’identité de marque, le contenu du site, les interfaces logicielles et
        les supports exclusifs sont protégés par les lois applicables en matière de propriété
        intellectuelle.
      </p>
      <p>
        Toute copie, modification, distribution ou utilisation commerciale non autorisée est interdite,
        sauf si la loi ou une autorisation écrite le permet.
      </p>

      <h2>16. Modification des conditions</h2>
      <p>
        VX44 peut mettre à jour les présentes Conditions générales pour tenir compte de l’évolution de ses
        services, de ses activités ou des exigences légales applicables.
      </p>
      <p>
        Les modifications importantes touchant des services déjà souscrits seront traitées conformément
        aux contrats applicables et à la loi.
      </p>

      <h2>17. Droit applicable</h2>
      <p>
        Les présentes Conditions sont régies par les lois de {placeholders.governingLaw}, sous réserve
        des protections légales impératives applicables.
      </p>
      <p>Toute procédure de règlement des litiges convenue séparément s’applique lorsqu’elle est légalement exécutoire.</p>

      <h2>18. Coordonnées</h2>
      <p>
        VX44 AI Monitoring
        <br />
        Site web :{" "}
        <a href="https://vx44ai.com" className="underline-offset-4 hover:text-gold hover:underline">
          https://vx44ai.com
        </a>
        <br />
        E-mail : <EmailLink />
        <br />
        Raison sociale : {placeholders.legalEntity}
        <br />
        Adresse professionnelle : {formatAddress()}
      </p>
      <p>Pour toute question concernant les présentes Conditions générales, contactez-nous par e-mail.</p>
    </>
  ),
};
