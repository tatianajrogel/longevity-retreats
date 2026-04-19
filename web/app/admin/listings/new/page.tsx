"use client";

import { useEffect, useState } from "react";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewListingPage() {
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    try { setAdminCode(localStorage.getItem("admin_auth_code") ?? ""); } catch {}
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: "1.5rem", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>New Listing</h1>
      <ListingForm adminCode={adminCode} />
    </div>
  );
}
