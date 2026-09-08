import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      <div className="home-hero">

        <h1>SAFE-PATH + PUNAR-MILAN</h1>

        <p className="home-subtitle">
          Connecting people, volunteers, and families during
          disaster situations.
        </p>

        <p className="home-description">
          PUNAR-MILAN helps register missing persons, manage
          volunteer information, and search for missing people
          to support family reunification during emergencies.
        </p>

      </div>


      <div className="home-options">

        <div className="home-card">

          <div className="home-icon">
            👥
          </div>

          <h2>Volunteer Registration</h2>

          <p>
            Register as a volunteer and provide your contact
            information to support disaster response activities.
          </p>

          <Link
            to="/volunteer-registration"
            className="home-button"
          >
            Register Volunteer
          </Link>

        </div>


        <div className="home-card">

          <div className="home-icon">
            🚨
          </div>

          <h2>Missing Person Registration</h2>

          <p>
            Register information about a missing person,
            including their last known location and contact details.
          </p>

          <Link
            to="/missing-person-registration"
            className="home-button"
          >
            Register Missing Person
          </Link>

        </div>


        <div className="home-card">

          <div className="home-icon">
            🔎
          </div>

          <h2>Search Missing Persons</h2>

          <p>
            Search the registered missing-person records using
            name, age, gender, or location.
          </p>

          <Link
            to="/missing-person-search"
            className="home-button"
          >
            Search Now
          </Link>

        </div>

      </div>


      <div className="home-info">

        <h2>About PUNAR-MILAN</h2>

        <p>
          PUNAR-MILAN is a missing-person and family-reunification
          module designed to help communities during disasters.
          It provides a centralized system for recording and
          searching missing-person information.
        </p>

      </div>

    </div>
  );
}

export default Home;