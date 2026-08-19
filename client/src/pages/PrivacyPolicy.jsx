import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, MapPin } from "lucide-react";

const cardClass = "border-lime-400/15 bg-[#020806] text-white shadow-sm";
const bodyClass = "space-y-3 text-white/70";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-lime-400/10 border border-lime-400/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-lime-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-white/50 text-sm">Last updated: January 24, 2026</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Eye className="w-5 h-5 text-lime-300" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className={bodyClass}>
              <p>We collect information that you provide directly to us:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and employee ID</li>
                <li>Mobile number for contact purposes</li>
                <li>Department and role information</li>
                <li>Profile photo (optional)</li>
                <li>Attendance records (check-in/check-out times)</li>
                <li>Leave requests and approvals</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Database className="w-5 h-5 text-lime-300" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className={bodyClass}>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Track and manage employee attendance</li>
                <li>Process leave requests and approvals</li>
                <li>Generate attendance reports for administrators</li>
                <li>Send notifications about attendance and leave status</li>
                <li>Maintain accurate employee records</li>
                <li>Improve our services and user experience</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <MapPin className="w-5 h-5 text-lime-300" />
                Permissions &amp; Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className={bodyClass}>
              <div>
                <h4 className="font-semibold mb-2 text-white">Location Access</h4>
                <p>We may request location access to verify attendance check-ins. Location data is used only for attendance verification and is not shared with third parties.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Camera Access</h4>
                <p>Camera access is requested only for uploading profile photos. We do not access your camera without your explicit permission.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Notifications</h4>
                <p>We send notifications for attendance reminders, check-in confirmations, and leave status updates. You can manage notification preferences in your device settings.</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Lock className="w-5 h-5 text-lime-300" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className={bodyClass}>
              <p>We take data security seriously and implement appropriate measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data is encrypted in transit and at rest</li>
                <li>Access to personal information is restricted to authorized personnel only</li>
                <li>Regular security audits and updates</li>
                <li>Secure authentication and session management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Shield className="w-5 h-5 text-lime-300" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className={bodyClass}>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of non-essential notifications</li>
                <li>Withdraw consent for optional data collection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-lg text-white">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>We retain your attendance and leave records as per company policy and legal requirements. Personal information is retained for as long as you are an active employee, and for a reasonable period thereafter for legal and audit purposes.</p>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-lg text-white">Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>This application is hosted on the Base44 platform. We do not share your personal information with third parties except as necessary to provide our services or as required by law.</p>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-lg text-white">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.</p>
            </CardContent>
          </Card>

          <Card className="border-lime-400/25 bg-lime-400/[0.06] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-lime-200">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>If you have any questions about this privacy policy or our data practices, please contact your organization's HR department or system administrator.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
