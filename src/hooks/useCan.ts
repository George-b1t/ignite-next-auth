import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if ( !isAuthenticated ) {
    return false;
  };

  if ( permissions?.length > 0 ) {
    const hashAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    });

    if ( !hashAllPermissions ) {
      return false;
    };
  };

  if ( roles?.length > 0 ) {
    const hashAllRoles = roles.some(role => {
      return user.roles.includes(role);
    });

    if ( !hashAllRoles ) {
      return false;
    };
  };

  return true;
};
