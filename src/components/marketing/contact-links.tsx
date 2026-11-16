import { contact } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { rich } from "@/i18n/format";

// Quiet in the footer's contact list. Inside a sentence a link is gold and underlined, so it
// doesn't rely on colour alone to stand out from the words around it.
const styles = {
  quiet: "underline-offset-4 transition hover:text-gold hover:underline",
  inline: "text-gold underline underline-offset-4 transition-colors duration-180 hover:text-text",
};

type LinkProps = { className?: string; variant?: keyof typeof styles };

export function EmailLink({ className = "", variant = "quiet" }: LinkProps) {
  return (
    <a href={`mailto:${contact.email}`} className={`${styles[variant]} ${className}`}>
      {contact.email}
    </a>
  );
}

export function PhoneLink({ className = "", variant = "quiet" }: LinkProps) {
  return (
    <a href={contact.phoneHref} className={`${styles[variant]} whitespace-nowrap ${className}`}>
      {contact.phone}
    </a>
  );
}

// "Prefer to call? …" and "Or email …": a way to reach a person without booking a call
// (SEC-280). Only the words around the links are translated. The number and the address read
// left to right in every language, Arabic included (SEC-288). In the phone menu these are
// tapped with a thumb, so each link is at least 32px tall, like the footer's.
const tapTarget = "inline-flex min-h-8 items-center";

export function CallOrEmail({ t, className = "" }: { t: Dictionary["common"]; className?: string }) {
  return (
    <div className={className}>
      <p>
        {rich(t.preferToCall, {
          phone: (
            <span dir="ltr">
              <PhoneLink variant="inline" className={tapTarget} />
            </span>
          ),
        })}
      </p>
      <p>
        {rich(t.orEmail, {
          email: (
            <span dir="ltr">
              <EmailLink variant="inline" className={tapTarget} />
            </span>
          ),
        })}
      </p>
    </div>
  );
}
