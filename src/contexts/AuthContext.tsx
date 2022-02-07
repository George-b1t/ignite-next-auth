import { createContext, ReactNode, useEffect, useState } from "react";
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut(lastSignout: boolean = false) {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  if ( !lastSignout ) {
    authChannel.postMessage('signOut');
  };

  Router.push('/');
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [ user, setUser ] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut(true);
          break;
        case 'signIn':
          Router.reload();
          break;
        default:
          break;
      };
    };
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if ( token ) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data;

        setUser({
          email,
          permissions,
          roles
        });
      }).catch(() => {
        signOut();
      });
    };
  }, []);

  async function signIn({ email, password }: SignInCredentials, firstSignin: boolean = false) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      });
  
      const {
        token,
        refreshToken,
        permissions,
        roles
      } = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 34 * 30,
        path: '/'
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 34 * 30,
        path: '/'
      });

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');

      if ( !firstSignin ) {
        authChannel.postMessage('signIn');
      };
    } catch (err) {
      console.log(err);
    };
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};