import { useState } from "react";

function MissingPersonSearch() {
  // Normal search
  const [searchTerm, setSearchTerm] = useState("");
  const [missingPeople, setMissingPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Match search
  const [matchData, setMatchData] = useState({
    moles: "",
    scars: "",
    tattoos: "",
    jewellery: "",
    clothingColor: "",
  });

  const [matchResults, setMatchResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchSearched, setMatchSearched] = useState(false);

  // -------------------------------
  // NORMAL SEARCH
  // -------------------------------
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMissingPeople([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        "http://192.168.1.60:5000/api/all-persons"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch missing persons");
      }

      const people = await response.json();

      const search = searchTerm.toLowerCase().trim();

      const filteredPeople = people.filter((person) => {
        const name = person.name?.toLowerCase() || "";
        const location =
          person.lastSeenLocation?.toLowerCase() || "";
        const age = person.age?.toString() || "";
        const gender = person.gender?.toLowerCase() || "";

        return (
          name.includes(search) ||
          location.includes(search) ||
          age.includes(search) ||
          gender.includes(search)
        );
      });

      setMissingPeople(filteredPeople);
    } catch (error) {
      console.error("Error searching backend:", error);

      alert(
        "Could not connect to the backend. Make sure your friend's backend is running."
      );
    }

    setLoading(false);
  };

  // -------------------------------
  // MATCH PERSON
  // -------------------------------
  const handleMatchChange = (event) => {
    const { name, value } = event.target;

    setMatchData({
      ...matchData,
      [name]: value,
    });
  };

  const handleMatchSearch = async () => {
    const hasInput = Object.values(matchData).some(
      (value) => value.trim() !== ""
    );

    if (!hasInput) {
      alert("Please enter at least one detail for matching.");
      return;
    }

    setMatchLoading(true);
    setMatchSearched(true);

    try {
      const response = await fetch(
        "http://192.168.1.60:5000/api/match-person",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(matchData),
        }
      );

      if (!response.ok) {
        throw new Error("Match search failed");
      }

      const results = await response.json();

      setMatchResults(results);
    } catch (error) {
      console.error("Error matching person:", error);

      alert(
        "Could not connect to the backend. Make sure your friend's backend is running."
      );

      setMatchResults([]);
    }

    setMatchLoading(false);
  };

  return (
    <div className="search-page">
      <div className="search-container">

        {/* ================================= */}
        {/* NORMAL SEARCH */}
        {/* ================================= */}

        <h1>Missing Person Search</h1>

        <p className="search-subtitle">
          Search for missing people by name, age, gender, or location.
        </p>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search by name, age, gender, or location..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            className="search-button"
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

        {loading && (
          <p className="result-count">
            Searching...
          </p>
        )}

        {searched && !loading && (
          <>
            <p className="result-count">
              {missingPeople.length} result(s) found
            </p>

            <div className="people-list">

              {missingPeople.length > 0 ? (

                missingPeople.map((person) => (

                  <div
                    className="person-card"
                    key={person.id}
                  >

                    <div className="person-photo">
                      <span>👤</span>
                    </div>

                    <div className="person-details">

                      <h2>{person.name}</h2>

                      <p>
                        <strong>Age:</strong>{" "}
                        {person.age}
                      </p>

                      <p>
                        <strong>Gender:</strong>{" "}
                        {person.gender}
                      </p>

                      <p>
                        <strong>Last Seen Location:</strong>{" "}
                        {person.lastSeenLocation}
                      </p>

                      <p>
                        <strong>Last Seen Date:</strong>{" "}
                        {person.dateLastSeen}
                      </p>

                      <p>
                        <strong>Description:</strong>{" "}
                        {person.description}
                      </p>

                      <p>
                        <strong>Contact Person:</strong>{" "}
                        {person.contactPersonName}
                      </p>

                      <p>
                        <strong>Contact Phone:</strong>{" "}
                        {person.contactPhoneNumber}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {person.status}
                      </p>

                    </div>

                  </div>

                ))

              ) : (

                <div className="no-results">

                  <h2>No Missing Person Found</h2>

                  <p>
                    Try searching with a different
                    name, age, gender, or location.
                  </p>

                </div>

              )}

            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="no-results">

            <h2>Search for a Missing Person</h2>

            <p>
              Enter a name, age, gender, or location
              above to find a missing person.
            </p>

          </div>
        )}


        {/* ================================= */}
        {/* MATCH PERSON SECTION */}
        {/* ================================= */}

        <div
          style={{
            marginTop: "50px",
            paddingTop: "30px",
            borderTop: "2px solid #ddd",
          }}
        >

          <h1>Match Missing Person</h1>

          <p className="search-subtitle">
            Enter identifying details to find possible matching
            missing-person records.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginTop: "25px",
            }}
          >

            {/* Moles */}

            <input
              type="text"
              name="moles"
              placeholder="Moles"
              value={matchData.moles}
              onChange={handleMatchChange}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Scars */}

            <input
              type="text"
              name="scars"
              placeholder="Scars"
              value={matchData.scars}
              onChange={handleMatchChange}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Tattoos */}

            <input
              type="text"
              name="tattoos"
              placeholder="Tattoos"
              value={matchData.tattoos}
              onChange={handleMatchChange}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Jewellery */}

            <input
              type="text"
              name="jewellery"
              placeholder="Jewellery"
              value={matchData.jewellery}
              onChange={handleMatchChange}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* Clothing Color */}

            <input
              type="text"
              name="clothingColor"
              placeholder="Clothing Color"
              value={matchData.clothingColor}
              onChange={handleMatchChange}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

          </div>

          <button
            className="search-button"
            onClick={handleMatchSearch}
            style={{
              marginTop: "20px",
            }}
          >
            {matchLoading
              ? "Matching..."
              : "Find Matching Persons"}
          </button>


          {/* MATCH RESULTS */}

          {matchSearched && !matchLoading && (

            <div style={{ marginTop: "25px" }}>

              <p className="result-count">
                {matchResults.length} possible match(es) found
              </p>

              {matchResults.length > 0 ? (

                <div className="people-list">

                  {matchResults.map((person) => (

                    <div
                      className="person-card"
                      key={person.id}
                    >

                      <div className="person-photo">
                        <span>👤</span>
                      </div>

                      <div className="person-details">

                        <h2>{person.name}</h2>

                        <p>
                          <strong>Age:</strong>{" "}
                          {person.age}
                        </p>

                        <p>
                          <strong>Gender:</strong>{" "}
                          {person.gender}
                        </p>

                        <p>
                          <strong>Camp:</strong>{" "}
                          {person.camp || "Not available"}
                        </p>

                        <p>
                          <strong>Last Seen Location:</strong>{" "}
                          {person.lastSeenLocation}
                        </p>

                        <p>
                          <strong>Moles:</strong>{" "}
                          {person.moles || "Not available"}
                        </p>

                        <p>
                          <strong>Scars:</strong>{" "}
                          {person.scars || "Not available"}
                        </p>

                        <p>
                          <strong>Tattoos:</strong>{" "}
                          {person.tattoos || "Not available"}
                        </p>

                        <p>
                          <strong>Jewellery:</strong>{" "}
                          {person.jewellery || "Not available"}
                        </p>

                        <p>
                          <strong>Clothing Color:</strong>{" "}
                          {person.clothingColor || "Not available"}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {person.status}
                        </p>

                        <p>
                          <strong>Contact Person:</strong>{" "}
                          {person.contactPersonName}
                        </p>

                        <p>
                          <strong>Contact Phone:</strong>{" "}
                          {person.contactPhoneNumber}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="no-results">

                  <h2>No Matching Person Found</h2>

                  <p>
                    No registered person matches the
                    details you entered.
                  </p>

                </div>

              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default MissingPersonSearch;