"use client";

import { useEffect, useState } from "react";

export type ActiveOrg = {
  org_id: string | null;
  org_name: string | null;
  role: string | null;
  perm_keys: string[];
};

export function useActiveOrg() {
  const [active, setActive] = useState<ActiveOrg>({
    org_id: null,
    org_name: null,
    role: null,
    perm_keys: [],
  });

  useEffect(() => {
    const org_id = localStorage.getItem("oryx.active_org_id");
    const org_name = localStorage.getItem("oryx.active_org_name");
    const role = localStorage.getItem("oryx.active_role");
    const permsRaw = localStorage.getItem("oryx.active_perms");

    let perm_keys: string[] = [];
    try {
      perm_keys = permsRaw ? JSON.parse(permsRaw) : [];
    } catch {
      perm_keys = [];
    }

    setActive({
      org_id: org_id || null,
      org_name: org_name || null,
      role: role || null,
      perm_keys,
    });
  }, []);

  return active;
}

export function hasPerm(active: ActiveOrg, perm: string) {
  return active.perm_keys.includes(perm);
}
