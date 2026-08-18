import Company from "../models/Company.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,30}$/;

const requireAdmin = (req, res) => {
  if (!req.user?.company_id) {
    res.status(403).json({ error: "No company associated with this user" });
    return false;
  }
  // Super admins implicitly count as admin.
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403).json({ error: "Admin only" });
    return false;
  }
  return true;
};

// GET /api/domains/info — public; uses resolveCompanyFromDomain.
export const getCompanyByHost = asyncHandler(async (req, res) => {
  if (req.resolved_company) {
    return res.json({
      company: req.resolved_company,
      domain_type: req.domain_type,
    });
  }
  res.json({ company: null, domain_type: req.domain_type || "main" });
});

// PUT /api/domains/subdomain — admin only
export const updateSubdomain = asyncHandler(async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const subdomain = String(req.body.subdomain || "").toLowerCase().trim();
  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return res.status(400).json({
      error:
        "Subdomain must be 3-30 characters, lowercase letters, numbers, and dashes only",
    });
  }
  if (["www", "app", "api", "admin", "mail"].includes(subdomain)) {
    return res.status(400).json({ error: "This subdomain is reserved" });
  }

  const existing = await Company.findOne({ subdomain });
  if (existing && String(existing._id) !== String(req.user.company_id)) {
    return res.status(409).json({ error: "This subdomain is taken" });
  }

  const company = await Company.findByIdAndUpdate(
    req.user.company_id,
    { subdomain },
    { new: true },
  );

  res.json({ company });
});
