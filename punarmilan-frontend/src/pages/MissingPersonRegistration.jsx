import { useState } from "react";

function MissingPersonRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    camp: "",
    moles: "",
    scars: "",
    tattoos: "",
    jewellery: "",
    clothingColor: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    description: "",
    contactName: "",
    contactPhone: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Handle text/input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle photo selection
  const handlePhotoChange = (event) => {
    const selectedPhoto = event.target.files[0];

    if (selectedPhoto) {
      setPhoto(selectedPhoto);
      setPhotoPreview(URL.createObjectURL(selectedPhoto));
    }
  };

  // Submit data to friend's backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://192.168.1.60:5000/api/register-person",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            age: formData.age,
            gender: formData.gender,

            // Identification details
            camp: formData.camp,
            moles: formData.moles,
            scars: formData.scars,
            tattoos: formData.tattoos,
            jewellery: formData.jewellery,
            clothingColor: formData.clothingColor,

            // Missing person details
            lastSeenLocation: formData.lastSeenLocation,
            dateLastSeen: formData.lastSeenDate,
            description: formData.description,

            // Photo filename only
            photo: photo ? photo.name : "",

            // Contact details
            contactPersonName: formData.contactName,
            contactPhoneNumber: formData.contactPhone,
            contactNumber: formData.contactPhone,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to register missing person"
        );
      }

      alert("Missing person registered successfully!");

      // Clear form
      setFormData({
        name: "",
        age: "",
        gender: "",
        camp: "",
        moles: "",
        scars: "",
        tattoos: "",
        jewellery: "",
        clothingColor: "",
        lastSeenLocation: "",
        lastSeenDate: "",
        description: "",
        contactName: "",
        contactPhone: "",
      });

      // Clear photo
      setPhoto(null);
      setPhotoPreview(null);

      // Reset file input
      event.target.reset();

    } catch (error) {
      console.error("Error connecting to backend:", error);

      alert(
        "Could not connect to the backend. Make sure your friend's backend is running."
      );
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">

        <h1>Missing Person Registration</h1>

        <p className="subtitle">
          Enter the details of the missing person to help with
          family reunification.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter missing person's full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Age */}
          <div className="form-group">
            <label>Age</label>

            <input
              type="number"
              name="age"
              placeholder="Enter age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">
                Select gender
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Camp */}
          <div className="form-group">
            <label>Camp / Shelter Name</label>

            <input
              type="text"
              name="camp"
              placeholder="Enter camp or shelter name"
              value={formData.camp}
              onChange={handleChange}
            />
          </div>

          {/* Moles */}
          <div className="form-group">
            <label>Moles</label>

            <input
              type="text"
              name="moles"
              placeholder="Example: Mole on left cheek"
              value={formData.moles}
              onChange={handleChange}
            />
          </div>

          {/* Scars */}
          <div className="form-group">
            <label>Scars</label>

            <input
              type="text"
              name="scars"
              placeholder="Example: Scar on right hand"
              value={formData.scars}
              onChange={handleChange}
            />
          </div>

          {/* Tattoos */}
          <div className="form-group">
            <label>Tattoos</label>

            <input
              type="text"
              name="tattoos"
              placeholder="Describe any visible tattoo"
              value={formData.tattoos}
              onChange={handleChange}
            />
          </div>

          {/* Jewellery */}
          <div className="form-group">
            <label>Jewellery</label>

            <input
              type="text"
              name="jewellery"
              placeholder="Example: Gold chain, watch"
              value={formData.jewellery}
              onChange={handleChange}
            />
          </div>

          {/* Clothing Color */}
          <div className="form-group">
            <label>Clothing Color</label>

            <input
              type="text"
              name="clothingColor"
              placeholder="Example: Blue shirt"
              value={formData.clothingColor}
              onChange={handleChange}
            />
          </div>

          {/* Last Seen Location */}
          <div className="form-group">
            <label>Last Seen Location</label>

            <input
              type="text"
              name="lastSeenLocation"
              placeholder="Where was the person last seen?"
              value={formData.lastSeenLocation}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date Last Seen */}
          <div className="form-group">
            <label>Date Last Seen</label>

            <input
              type="date"
              name="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Describe the person and other useful identifying information"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          {/* Photo */}
          <div className="form-group">
            <label>Upload Photo</label>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
            />

            {/* Photo Preview */}
            {photoPreview && (
              <div
                style={{
                  marginTop: "15px",
                  textAlign: "center",
                }}
              >
                <img
                  src={photoPreview}
                  alt="Selected missing person"
                  style={{
                    width: "150px",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid #1f3c88",
                  }}
                />

                <p
                  style={{
                    color: "#1f3c88",
                    fontWeight: "600",
                    marginTop: "8px",
                  }}
                >
                  Photo selected successfully
                </p>
              </div>
            )}
          </div>

          {/* Contact Person Name */}
          <div className="form-group">
            <label>Contact Person Name</label>

            <input
              type="text"
              name="contactName"
              placeholder="Enter family/contact person's name"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contact Phone */}
          <div className="form-group">
            <label>Contact Phone Number</label>

            <input
              type="tel"
              name="contactPhone"
              placeholder="Enter contact phone number"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="register-button"
          >
            Register Missing Person
          </button>

        </form>
      </div>
    </div>
  );
}

export default MissingPersonRegistration;