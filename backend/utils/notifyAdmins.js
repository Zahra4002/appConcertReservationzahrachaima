const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports = async function notifyAdmins(
  type,
  message,
  lien
) {
  const admins = await User.find({ role: "admin" }).select("_id");

  await Notification.insertMany(
    admins.map(admin => ({
      destinataire: admin._id,
      type,
      message,
      lien
    }))
  );
};