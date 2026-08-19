// Reset the app-access gate: revoke has_app_access from ALL users so that only
// the /join-admin unlock, creating/joining a workspace, or super-admin status
// grants access to the create-workspace page. Existing workspace members keep
// using their app (the gate only guards create-workspace, not the whole app).
//
//   node src/scripts/resetAppAccess.js
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  const before = await User.find({}, "email role company_id has_app_access").lean();
  console.log("Accounts before reset:");
  for (const u of before) {
    console.log(
      `  ${u.email} | role=${u.role} | workspace=${u.company_id ? "yes" : "no"} | had_access=${!!u.has_app_access}`,
    );
  }

  const res = await User.updateMany({}, { $set: { has_app_access: false } });
  console.log(`\nRevoked app access from ${res.modifiedCount} user(s).`);
  console.log("Super admins bypass the gate regardless; everyone else must unlock via /join-admin.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Reset failed:", err.message);
  process.exit(1);
});
