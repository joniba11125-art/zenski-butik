"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StaffMember = {
  id: string;
  name: string;
  is_active: boolean | null;
};

const selectedStaffStorageKey = "dressmeup_selected_staff";

export function StaffSelector() {
  const supabase = createClient();

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedStaffName, setSelectedStaffName] = useState("");

  useEffect(() => {
    async function loadStaffMembers() {
      const savedStaff = window.localStorage.getItem(selectedStaffStorageKey);

      if (savedStaff) {
        try {
          const parsedStaff = JSON.parse(savedStaff) as StaffMember;
          setSelectedStaffId(parsedStaff.id);
          setSelectedStaffName(parsedStaff.name);
        } catch {
          window.localStorage.removeItem(selectedStaffStorageKey);
        }
      }

      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Greška pri učitavanju radnica:", error.message);
        setStaffMembers([]);
        return;
      }

      setStaffMembers((data as StaffMember[]) ?? []);
    }

    loadStaffMembers();
  }, [supabase]);

  function selectStaff(staffId: string) {
    const staff = staffMembers.find((item) => item.id === staffId);

    if (!staff) {
      setSelectedStaffId("");
      setSelectedStaffName("");
      window.localStorage.removeItem(selectedStaffStorageKey);
      return;
    }

    setSelectedStaffId(staff.id);
    setSelectedStaffName(staff.name);

    window.localStorage.setItem(
      selectedStaffStorageKey,
      JSON.stringify({
        id: staff.id,
        name: staff.name,
        is_active: staff.is_active,
      })
    );
  }

  return (
    <Card className="mb-6 rounded-3xl border-neutral-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ko danas radi?</CardTitle>
        <UserRound className="h-5 w-5 text-neutral-500" />
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-neutral-600">
              Izaberi radnicu prije rada sa rezervacijama. Sistem će kasnije
              zapisivati ko je promijenio status narudžbe.
            </p>

            {selectedStaffName ? (
              <p className="mt-2 text-sm font-semibold text-neutral-950">
                Trenutno izabrana radnica: {selectedStaffName}
              </p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-red-600">
                Radnica još nije izabrana.
              </p>
            )}
          </div>

          <select
            value={selectedStaffId}
            onChange={(event) => selectStaff(event.target.value)}
            className="h-11 min-w-56 rounded-full border bg-white px-4 text-sm outline-none focus:border-neutral-950"
          >
            <option value="">Izaberi radnicu</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
