import { ReactNode, CSSProperties } from "react";
import { MOBILE_MAX_WIDTH } from "../../../legacy-client/src/constants";

type StaticPageProps = {
  children: ReactNode;
};

export default function StaticPage({ children }: StaticPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        paddingBottom: "5rem", // Space for bottom menu bar
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: MOBILE_MAX_WIDTH,
          margin: "0 auto",
          padding: "2rem 1.5rem",
          color: "#fff",
          lineHeight: "1.6",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Styled heading components
export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        fontSize: "2rem",
        marginBottom: "1.5rem",
        fontWeight: 600,
      }}
    >
      {children}
    </h1>
  );
}

export function Subheading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "1.5rem",
        marginTop: "2rem",
        marginBottom: "1rem",
        fontWeight: 600,
      }}
    >
      {children}
    </h2>
  );
}

// Styled link component
export function Link({
  href,
  children,
  ...props
}: {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      style={{
        color: "#6b9eff",
        textDecoration: "underline",
      }}
      {...props}
    >
      {children}
    </a>
  );
}

// Styled paragraph component
export function Paragraph({ children }: { children: ReactNode }) {
  return <p style={{ marginBottom: "1rem" }}>{children}</p>;
}

// Styled form components
export function Label({ children }: { children: ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: "0.5rem",
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  );
}

export function Input({
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { style?: CSSProperties }) {
  return (
    <input
      style={{
        width: "100%",
        padding: "0.75rem",
        fontSize: "1rem",
        backgroundColor: "#2a2a2a",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        color: "#fff",
        fontFamily: "inherit",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    />
  );
}

export function Textarea({
  style,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  style?: CSSProperties;
}) {
  return (
    <textarea
      style={{
        width: "100%",
        padding: "0.75rem",
        fontSize: "1rem",
        backgroundColor: "#2a2a2a",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        color: "#fff",
        fontFamily: "inherit",
        display: "block",
        resize: "vertical",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    />
  );
}

export function Button({
  style,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { style?: CSSProperties }) {
  return (
    <button
      style={{
        padding: "0.75rem 2rem",
        fontSize: "1rem",
        fontWeight: 500,
        backgroundColor: "#6b9eff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "opacity 0.2s",
        ...style,
      }}
      disabled={disabled}
      {...props}
    />
  );
}
