import {
  createContext,
  useContext,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../services/api";

const AuthContext = createContext(null);

function getUserFromToken(token) {
  try {
    const decoded = jwtDecode(token);

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      id:
        decoded.Id ??
        decoded.id ??
        decoded.nameid ??
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],

      name:
        decoded.unique_name ??
        decoded.name ??
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] ??
        "Usuário",

      role:
        decoded.role ??
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],

      firstAccess:
        String(decoded.FirstAccess).toLowerCase() === "true",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken && getUserFromToken(savedToken)) {
      return savedToken;
    }

    localStorage.removeItem("token");
    return null;
  });

  const user = token ? getUserFromToken(token) : null;

  async function login(email, password) {
    // Ajuste os nomes das propriedades se o LoginDTO
    // da API utilizar uma nomenclatura diferente.
    const response = await api.post("Login/login", {
      email,
      password,
    });

    const result = response.data;

    if (
      result.statusCode < 200 ||
      result.statusCode >= 300 ||
      !result.entity
    ) {
      throw new Error(
        result.validationErrors?.join("\n") ||
        result.message ||
        "Não foi possível realizar o login."
      );
    }

    const receivedToken = result.entity;
    const decodedUser = getUserFromToken(receivedToken);

    if (!decodedUser) {
      throw new Error("Token inválido ou expirado.");
    }

    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);

    return decodedUser;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider não encontrado.");
  }

  return context;
}
