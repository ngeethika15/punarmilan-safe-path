const sosCases = require("../models/sosModel");

const createSOS = (req, res) => {
  try {
    const {
      personId,
      name,
      phone,
      currentLocation,
      lastKnownSafeLocation,
      lastSafeRoute,
      timestamp,
      connectivityStatus,
      injurySeverity,
      mentalHealthFlag
    } = req.body;

    if (!name || !currentLocation) {
      return res.status(400).json({
        success: false,
        message: "Name and current location are required"
      });
    }

    const newSOS = {
      id: Date.now().toString(),
      personId: personId || null,
      name,
      phone: phone || null,

      currentLocation: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      },

      lastKnownSafeLocation: lastKnownSafeLocation || null,

      lastSafeRoute: lastSafeRoute || null,

      timestamp: timestamp || new Date().toISOString(),

      connectivityStatus: connectivityStatus || "online",

      injurySeverity: injurySeverity || "unknown",

      mentalHealthFlag: Boolean(mentalHealthFlag),

      status: "ACTIVE",

      createdAt: new Date().toISOString()
    };

    sosCases.push(newSOS);

    return res.status(201).json({
      success: true,
      message: "SOS alert created successfully",
      data: newSOS
    });
  } catch (error) {
    console.error("SOS creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create SOS alert"
    });
  }
};


const getActiveSOS = (req, res) => {
  const activeCases = sosCases.filter(
    (sos) => sos.status === "ACTIVE"
  );

  return res.json({
    success: true,
    count: activeCases.length,
    data: activeCases
  });
};


const getSOSById = (req, res) => {
  const sos = sosCases.find(
    (item) => item.id === req.params.id
  );

  if (!sos) {
    return res.status(404).json({
      success: false,
      message: "SOS case not found"
    });
  }

  return res.json({
    success: true,
    data: sos
  });
};


const updateSOSStatus = (req, res) => {
  const sos = sosCases.find(
    (item) => item.id === req.params.id
  );

  if (!sos) {
    return res.status(404).json({
      success: false,
      message: "SOS case not found"
    });
  }

  const { status } = req.body;

  const allowedStatuses = [
    "ACTIVE",
    "ACKNOWLEDGED",
    "RESCUED",
    "CANCELLED"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid SOS status"
    });
  }

  sos.status = status;
  sos.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: "SOS status updated successfully",
    data: sos
  });
};


module.exports = {
  createSOS,
  getActiveSOS,
  getSOSById,
  updateSOSStatus
};