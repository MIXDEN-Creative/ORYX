"use client";

import { useRouter } from "next/navigation";
import { useActiveOrg } from "./useActiveOrg";

export default function Topbar() {
  const router = useRouter();
  const active = useActiveOrg();

  return (
    <div className="topbar glass pop">
      <div className="topLeft">
        <div className="topTitle">ORYX</div>
        <div className="topCrumb">
          {active.org_name ? (
            <>
              <span className="pill">{active.org_name}</span>
              <span className="small">Role: {active.role || "member"}</span>
            </>
          ) : (
            <span className="small">No org selected</span>
          )}
        </div>
      </div>

      <div className="topRight">
        <button
          className="ghostBtn"
          onClick={() => {
            localStorage.removeItem("oryx.active_org_id");
            localStorage.removeItem("oryx.active_org_name");
            localStorage.removeItem("oryx.active_role");
            localStorage.removeItem("oryx.active_perms");
            router.push("/admin/select-org");
          }}
        >
          Switch org
        </button>
      </div>
    </div>
  );
}
