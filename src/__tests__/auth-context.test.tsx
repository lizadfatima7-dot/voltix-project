import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth";

// Mock Supabase client
const mockUnsubscribe = vi.fn();
type AuthCallback = (event: string, session: unknown) => void;
let capturedAuthCallback: AuthCallback | null = null;

const mockGetSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: AuthCallback) => {
        capturedAuthCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
    },
  },
}));

// Test component that uses the auth hook
function TestConsumer() {
  const { user, session, loading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? "loading" : "ready"}</span>
      <span data-testid="user">{user?.email ?? "no-user"}</span>
      <span data-testid="session">{session ? "has-session" : "no-session"}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe("auth.tsx - AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  describe("AuthProvider", () => {
    it("renders children", async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );
      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("starts with loading=true", () => {
      // Delay getSession to keep loading state
      mockGetSession.mockReturnValue(new Promise(() => {}));
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    });

    it("sets loading=false after getSession resolves", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
    });

    it("provides null user when no session", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        expect(screen.getByTestId("session")).toHaveTextContent("no-session");
      });
    });

    it("provides user from session", async () => {
      const mockSession = {
        user: { email: "test@example.com", id: "123" },
        access_token: "token",
      };
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
        expect(screen.getByTestId("session")).toHaveTextContent("has-session");
      });
    });

    it("subscribes to auth state changes", () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      // The mock captures the callback, so it was called
      expect(capturedAuthCallback).not.toBeNull();
    });

    it("unsubscribes on unmount", () => {
      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it("updates session when auth state changes", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      // Initially no session
      await waitFor(() => {
        expect(screen.getByTestId("session")).toHaveTextContent("no-session");
      });
      
      // Simulate auth state change using captured callback
      const newSession = {
        user: { email: "new@example.com", id: "456" },
        access_token: "new-token",
      };
      
      act(() => {
        capturedAuthCallback?.("SIGNED_IN", newSession);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("new@example.com");
        expect(screen.getByTestId("session")).toHaveTextContent("has-session");
      });
    });

    it("signOut calls supabase.auth.signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });
      mockGetSession.mockResolvedValue({ data: { session: null } });
      
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
      
      const button = screen.getByRole("button", { name: /sign out/i });
      await act(async () => {
        button.click();
      });
      
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("useAuth", () => {
    it("throws error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useAuth must be used within AuthProvider");
      
      consoleSpy.mockRestore();
    });
  });
});
