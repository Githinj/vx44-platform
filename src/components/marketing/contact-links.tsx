import { contact } from "@/content/site";

const linkClass = "underline-offset-4 transition hover:text-gold hover:underline";

export function EmailLink({ className = "" }: { className?: string }) {
  return (
    <a href={`mailto:${contact.email}`} className={`${linkClass} ${className}`}>
      {contact.email}
    </a>
  );
}

export function PhoneLink({ className = "" }: { className?: string }) {
  return (
    <a href={contact.phoneHref} className={`${linkClass} whitespace-nowrap ${className}`}>
      {contact.phone}
    </a>
  );
}
