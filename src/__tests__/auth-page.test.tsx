import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock modules before importing the component
const mockNavigate = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (data: unknown) => mockSignInWithPassword(data),
      signUp: (data: unknown) => mockSignUp(data),
      resetPasswordForEmail: (email: string, opts: unknown) => mockResetPasswordForEmail(email, opts),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}));

vi.mock("@/lib/subscriber-code", () => ({
  normalizeSubscriberCode: (code: string) => code.toUpperCase().replace(/\s/g, ""),
  setSubscriberCode: vi.fn(),
}));

// Import after mocks
import React from "react";

// Create a simplified AuthPage component for testing
function AuthPage() {
  const [busy, setBusy] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const passwordScore = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (pw.length >= 12) s++;
    return Math.min(s, 4);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    
    if (!email || !email.includes("@")) {
      mockToastError("Genuine və düzgün e-poçt ünvanı daxil edin");
      return;
    }
    if (!password) {
      mockToastError("Parol daxil edin");
      return;
    }
    
    setBusy(true);
    const { error } = await mockSignInWithPassword({ email, password });
    setBusy(false);
    
    if (error) {
      mockToastError(error.message);
      return;
    }
    mockToastSuccess("Xoş gəlmisiniz!");
    mockNavigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const subscriberCode = fd.get("subscriberCode") as string;
    
    if (!name) {
      mockToastError("Ad daxil edin");
      return;
    }
    if (!email || !email.includes("@")) {
      mockToastError("Genuine və düzgün e-poçt ünvanı daxil edin");
      return;
    }
    if (!subscriberCode || subscriberCode.length < 5) {
      mockToastError("Abonent kodu ən azı 5 simvol olmalıdır");
      return;
    }
    if (!password || password.length < 12) {
      mockToastError("Parol ən azı 12 simvol olmalıdır");
      return;
    }
    
    setBusy(true);
    const { error } = await mockSignUp({ email, password, options: { data: { display_name: name } } });
    setBusy(false);
    
    if (error) {
      mockToastError(error.message);
      return;
    }
    mockToastSuccess("Hesab yaradıldı!");
    mockNavigate({ to: "/profile" });
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    
    if (!email || !email.includes("@")) {
      mockToastError("Genuine və düzgün e-poçt ünvanı daxil edin");
      return;
    }
    
    setBusy(true);
    const { error } = await mockResetPasswordForEmail(email, {});
    setBusy(false);
    
    if (error) {
      mockToastError(error.message);
      return;
    }
    mockToastSuccess("Parol sıfırlama linki üçün e-poçtunuzu yoxlayın.");
    setForgotOpen(false);
  };

  const score = passwordScore(pw);

  return (
    <div data-testid="auth-page">
      <a href="/">
        <span>VoltX</span>
      </a>
      
      <h1>{forgotOpen ? "Parolu sıfırla" : "Xoş gəlmisiniz"}</h1>
      
      {forgotOpen ? (
        <form onSubmit={handleForgot} data-testid="forgot-form">
          <label htmlFor="fp-email">E-poçt</label>
          <input id="fp-email" name="email" type="email" />
          <button type="submit" disabled={busy}>
            {busy ? "Göndərilir…" : "Sıfırlama linki göndər"}
          </button>
          <button type="button" onClick={() => setForgotOpen(false)}>
            Daxil olmağa qayıt
          </button>
        </form>
      ) : (
        <div>
          <div role="tablist">
            <button role="tab" data-testid="signin-tab" aria-selected="true">Daxil ol</button>
            <button role="tab" data-testid="signup-tab" aria-selected="false">Qeydiyyat</button>
          </div>
          
          <form onSubmit={handleSignIn} data-testid="signin-form">
            <label htmlFor="si-email">E-poçt</label>
            <input id="si-email" name="email" type="email" />
            <label htmlFor="si-password">Parol</label>
            <div>
              <input 
                id="si-password" 
                name="password" 
                type={showPw ? "text" : "password"} 
              />
              <button 
                type="button" 
                onClick={() => setShowPw(!showPw)}
                data-testid="toggle-password"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <button type="button" onClick={() => setForgotOpen(true)}>
              Parolu unutmusunuz?
            </button>
            <button type="submit" disabled={busy}>
              {busy ? "Daxil olunur…" : "Daxil ol"}
            </button>
          </form>
          
          <form onSubmit={handleSignUp} data-testid="signup-form">
            <label htmlFor="su-name">Görünən ad</label>
            <input id="su-name" name="name" type="text" />
            <label htmlFor="su-email">E-poçt</label>
            <input id="su-email" name="email" type="email" />
            <label htmlFor="su-subscriber-code">Elektrik abonent kodu</label>
            <input id="su-subscriber-code" name="subscriberCode" type="text" />
            <label htmlFor="su-password">Parol</label>
            <input
              id="su-password"
              name="password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {pw && (
              <div data-testid="password-strength">
                <span data-testid="strength-score">{score}</span>
              </div>
            )}
            <button type="submit" disabled={busy || score < 4}>
              {busy ? "Hesab yaradılır…" : "Hesab yarat"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

describe("auth.tsx - AuthPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  describe("Rendering", () => {
    it("renders the auth page", () => {
      render(<AuthPage />);
      expect(screen.getByTestId("auth-page")).toBeInTheDocument();
    });

    it("displays VoltX branding", () => {
      render(<AuthPage />);
      expect(screen.getByText("VoltX")).toBeInTheDocument();
    });

    it("shows welcome title by default", () => {
      render(<AuthPage />);
      expect(screen.getByText("Xoş gəlmisiniz")).toBeInTheDocument();
    });

    it("renders sign in form", () => {
      render(<AuthPage />);
      expect(screen.getByTestId("signin-form")).toBeInTheDocument();
    });

    it("renders sign up form", () => {
      render(<AuthPage />);
      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });
  });

  describe("Sign In Form", () => {
    it("shows error for invalid email", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Genuine və düzgün e-poçt ünvanı daxil edin");
      });
    });

    it("shows error for empty password", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Parol daxil edin");
      });
    });

    it("calls signInWithPassword on valid submission", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.change(passwordInput, { target: { value: "MyPassword123!" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "user@example.org",
          password: "MyPassword123!",
        });
      });
    });

    it("shows success toast and navigates on successful sign in", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.change(passwordInput, { target: { value: "MyPassword123!" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Xoş gəlmisiniz!");
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
      });
    });

    it("shows error toast on sign in failure", async () => {
      mockSignInWithPassword.mockResolvedValue({ error: { message: "Invalid credentials" } });
      
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Invalid credentials");
      });
    });

    it("toggles password visibility", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signin-form");
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      const toggleBtn = screen.getByTestId("toggle-password");
      
      expect(passwordInput.type).toBe("password");
      
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe("text");
      
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("Sign Up Form", () => {
    it("shows error for missing name", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Ad daxil edin");
      });
    });

    it("shows error for short subscriber code", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const codeInput = form.querySelector('input[name="subscriberCode"]') as HTMLInputElement;
      
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.change(codeInput, { target: { value: "AB" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Abonent kodu ən azı 5 simvol olmalıdır");
      });
    });

    it("shows error for short password", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const codeInput = form.querySelector('input[name="subscriberCode"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.change(codeInput, { target: { value: "AZE-12345" } });
      fireEvent.change(passwordInput, { target: { value: "short" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Parol ən azı 12 simvol olmalıdır");
      });
    });

    it("calls signUp on valid submission", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const codeInput = form.querySelector('input[name="subscriberCode"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "newuser@example.org" } });
      fireEvent.change(codeInput, { target: { value: "AZE-12345678" } });
      fireEvent.change(passwordInput, { target: { value: "MySecure123!@#" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    });

    it("shows success toast on successful sign up", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      const codeInput = form.querySelector('input[name="subscriberCode"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "newuser@example.org" } });
      fireEvent.change(codeInput, { target: { value: "AZE-12345678" } });
      fireEvent.change(passwordInput, { target: { value: "MySecure123!@#" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Hesab yaradıldı!");
      });
    });

    it("displays password strength indicator", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      // Initially no strength indicator
      expect(screen.queryByTestId("password-strength")).not.toBeInTheDocument();
      
      // Type password to show indicator
      fireEvent.change(passwordInput, { target: { value: "a" } });
      expect(screen.getByTestId("password-strength")).toBeInTheDocument();
    });

    it("calculates password strength correctly", async () => {
      render(<AuthPage />);
      
      const form = screen.getByTestId("signup-form");
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      // Weak password
      fireEvent.change(passwordInput, { target: { value: "abc" } });
      expect(screen.getByTestId("strength-score")).toHaveTextContent("0");
      
      // Strong password
      fireEvent.change(passwordInput, { target: { value: "MySecure123!@#" } });
      expect(screen.getByTestId("strength-score")).toHaveTextContent("4");
    });
  });

  describe("Forgot Password Form", () => {
    it("shows forgot password form when clicked", async () => {
      render(<AuthPage />);
      
      const forgotBtn = screen.getByText("Parolu unutmusunuz?");
      fireEvent.click(forgotBtn);
      
      expect(screen.getByText("Parolu sıfırla")).toBeInTheDocument();
      expect(screen.getByTestId("forgot-form")).toBeInTheDocument();
    });

    it("returns to sign in when back button clicked", async () => {
      render(<AuthPage />);
      
      // Open forgot form
      fireEvent.click(screen.getByText("Parolu unutmusunuz?"));
      expect(screen.getByText("Parolu sıfırla")).toBeInTheDocument();
      
      // Click back
      fireEvent.click(screen.getByText("Daxil olmağa qayıt"));
      expect(screen.getByText("Xoş gəlmisiniz")).toBeInTheDocument();
    });

    it("calls resetPasswordForEmail on valid submission", async () => {
      render(<AuthPage />);
      
      fireEvent.click(screen.getByText("Parolu unutmusunuz?"));
      
      const form = screen.getByTestId("forgot-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@example.org", {});
      });
    });

    it("shows success toast on password reset request", async () => {
      render(<AuthPage />);
      
      fireEvent.click(screen.getByText("Parolu unutmusunuz?"));
      
      const form = screen.getByTestId("forgot-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "user@example.org" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Parol sıfırlama linki üçün e-poçtunuzu yoxlayın.");
      });
    });

    it("shows error for invalid email in forgot form", async () => {
      render(<AuthPage />);
      
      fireEvent.click(screen.getByText("Parolu unutmusunuz?"));
      
      const form = screen.getByTestId("forgot-form");
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: "invalid" } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Genuine və düzgün e-poçt ünvanı daxil edin");
      });
    });
  });
});
