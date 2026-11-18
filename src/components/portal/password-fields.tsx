import { Field, inputClass } from "@/components/admin/ui";
import type { AppDictionary } from "@/i18n/app/en";
import { fill } from "@/i18n/format";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/password";

// The new-password pair, shared by the Account page and the set-password step of an invite, so
// both apply the rules in src/lib/password.ts the same way.
export function PasswordFields({ t }: { t: AppDictionary["account"] }) {
  return (
    <>
      <Field label={t.newPassword}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          maxLength={PASSWORD_MAX}
          aria-describedby="password-hint"
          className={inputClass}
        />
      </Field>
      <p id="password-hint" className="text-sm text-muted">
        {fill(t.passwordHint, { min: PASSWORD_MIN })}
      </p>
      <Field label={t.confirmPassword}>
        <input name="confirm" type="password" autoComplete="new-password" required maxLength={PASSWORD_MAX} className={inputClass} />
      </Field>
    </>
  );
}
