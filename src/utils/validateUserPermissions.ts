type User = {
  permissions: string[];
  roles: string[];
};

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  roles,
  permissions
}: ValidateUserPermissionsParams) {
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