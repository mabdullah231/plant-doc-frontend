import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./screens/Layout";
import AdminLayout from "./screens/user/AdminLayout";
import Helpers from "./Config/Helpers";
import { Home, Login, Register, Profile } from "./screens";
import {
  AdminDashboard
} from "./screens/admin/pages";
import UserLayout from "./screens/user/UserLayout";
import {
  UserDashboard,
} from "./screens/user/pages";
// import Loader from "./components/Common/Loader";


const Auth = ({ children, isAuth = true, allowedRoles = [] }) => {
  let user = Helpers.getItem("user", true); // Get stored user
  let token = Helpers.getItem("token"); // Get stored token

  // If the route requires authentication
  if (isAuth) {
    if (!user || !token) {
      Helpers.toast("error", "Please login to continue");
      return <Navigate to="/login" />;
    }

    // Check if user has permission to access the route
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(parseInt(user.user_type))
    ) {
      Helpers.toast("error", "Access denied.");

      // Redirect based on user role
      switch (parseInt(user.user_type)) {
        case 0:
          return <Navigate to="/admin/dashboard" />;
        case 1:
          return <Navigate to="/employer/dashboard" />;
        case 2:
          return <Navigate to="/" />;
        default:
          return <Navigate to="/login" />;
      }
    }

    return children; // User is authenticated and has access
  }

  // For public routes
  else {
    if (user && token) {
      switch (parseInt(user.user_type)) {
        case 0:
          return <Navigate to="/admin/dashboard" />;
        case 1:
          return <Navigate to="/employer/dashboard" />;
      }
    }
    return children;
  }
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <Auth isAuth={false}>
                <Login />
              </Auth>
            }
          />
          <Route
            path="/profile"
            element={
              <Auth isAuth={true}>
                <Profile/>
              </Auth>
            }
          />
          <Route
            path="/register"
            element={
              <Auth isAuth={false}>
                <Register />
              </Auth>
            }
          />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              <Auth allowedRoles={[0]}>
                <AdminDashboard />
              </Auth>
            }
          />
        </Route>
        <Route path="/user" element={<EmployerLayout />}>
          <Route
            path="dashboard"
            element={
              <Auth allowedRoles={[1]}>
                <EmployerDashboard />
              </Auth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
