import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface KeycloakConfig {
  issuerUrl: string;
  clientId: string;
}

export interface VerifiedUser {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
}

let cachedJwkSet: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function verifyToken(
  token: string,
  config: KeycloakConfig
): Promise<VerifiedUser | null> {
  try {
    if (!cachedJwkSet) {
      cachedJwkSet = createRemoteJWKSet(
        new URL(`${config.issuerUrl}/protocol/openid-connect/certs`)
      );
    }

    const { payload } = await jwtVerify(token, cachedJwkSet, {
      issuer: config.issuerUrl,
      audience: config.clientId, // Some configurations may use 'account' or not require audience check
    });

    // Extract realm roles or resource roles based on standard Keycloak token structure
    const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
    const roles = realmAccess?.roles || [];

    return {
      id: payload.sub as string,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      roles,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function hasRole(user: VerifiedUser | null, requiredRole: string): boolean {
  if (!user) return false;
  return user.roles.includes(requiredRole);
}
