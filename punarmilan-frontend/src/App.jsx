import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import VolunteerRegistration from "./pages/VolunteerRegistration";
import MissingPersonRegistration from "./pages/MissingPersonRegistration";
import MissingPersonSearch from "./pages/MissingPersonSearch";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar">

        <div className="navbar-title">
          SAFE-PATH + PUNAR-MILAN
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/volunteer-registration">
            Volunteer Registration
          </Link>

          <Link to="/missing-person-registration">
            Missing Person Registration
          </Link>

          <Link to="/missing-person-search">
            Missing Person Search
          </Link>

        </div>

      </nav>


      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/volunteer-registration"
          element={<VolunteerRegistration />}
        />

        <Route
          path="/missing-person-registration"
          element={<MissingPersonRegistration />}
        />

        <Route
          path="/missing-person-search"
          element={<MissingPersonSearch />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;