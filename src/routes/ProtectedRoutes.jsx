import { Navigate } from 'react-router-dom';
import useUserStore from "../store/userStore";
import { getProfilePath } from "../utils/functions"

export const ProtectedRoutes = ({ children, allowedRoles }) => {
  const user = useUserStore(state => state.user);
  
  // Extraemos el perfil y el ID para construir la ruta de redirección
  const userRole = user?.user?.profile;
  const userId = user?.user?.id;

  // Si el usuario NO tiene un rol permitido para esta ruta
  if (!allowedRoles.includes(userRole)) {
    
    return <Navigate to={getProfilePath(userRole,userId)} replace />;

    // Replicamos la lógica de redirección por perfil del Login
    /*switch (userRole) {
      case 'ADMINISTRADOR':
        return <Navigate to={`/administrators/${userId}`} replace />;
      
      case 'PROFESOR':
        return <Navigate to={`/teachers/${userId}`} replace />;
      
      case 'ALUMNO':
        return <Navigate to={`/students/${userId}`} replace />;
      
      case 'EMPRESA':
        return <Navigate to={`/companies/${userId}`} replace />;
      
      default:
        // Si por algún motivo no hay rol conocido, al login
        return <Navigate to="/" replace />;
    }*/
  }

  // Si tiene permiso, renderizamos el componente (children)
  return children;
};