// Small text primitives shared by every wizard step form -- mirrors the
// label/error markup already used in app/login/page.tsx so form fields look
// identical across the whole app.

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-muted">
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-red">{children}</p>;
}
