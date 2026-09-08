import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

function VolunteerRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    location: "",
    emergencyContact: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await addDoc(collection(db, "volunteers"), {
        ...formData,
        createdAt: new Date(),
      });

      alert("Volunteer registration saved successfully!");

      setFormData({
        name: "",
        age: "",
        phone: "",
        email: "",
        location: "",
        emergencyContact: "",
      });
    } catch (error) {
      console.error("Error saving volunteer:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>Volunteer Registration</h1>

        <p className="subtitle">
          Register as a volunteer to help during disaster situations.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Age</label>

            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Current Location</label>

            <input
              type="text"
              name="location"
              placeholder="Enter your current location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>

            <input
              type="tel"
              name="emergencyContact"
              placeholder="Enter emergency contact number"
              value={formData.emergencyContact}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-button">
            Register as Volunteer
          </button>
        </form>
      </div>
    </div>
  );
}

export default VolunteerRegistration;