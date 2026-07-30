"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Laptop, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Device {
  id: string;
  name: string;
  location: string;
  lastActive: string;
  thisDevice?: boolean;
  icon: typeof Smartphone;
}

const INITIAL_DEVICES: Device[] = [
  { id: "d1", name: "iPhone 15 Pro", location: "Sydney, AU", lastActive: "Active now", thisDevice: true, icon: Smartphone },
  { id: "d2", name: "MacBook Pro", location: "Sydney, AU", lastActive: "2 hours ago", icon: Laptop },
  { id: "d3", name: "iPad Air", location: "Melbourne, AU", lastActive: "3 days ago", icon: Tablet },
];

export default function ActiveDevicesPage() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  function signOutDevice(id: string) {
    setDevices((d) => d.filter((device) => device.id !== id));
  }

  function signOutAllOthers() {
    setDevices((d) => d.filter((device) => device.thisDevice));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href="/settings/account" className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Active Devices</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col gap-2.5">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <Card key={device.id} className="flex items-center gap-2.5 p-3">
                <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-surface-3 text-muted">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[12px] font-bold">
                    {device.name}
                    {device.thisDevice && (
                      <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-background">This device</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-2">
                    {device.location} · {device.lastActive}
                  </p>
                </div>
                {!device.thisDevice && (
                  <button type="button" onClick={() => signOutDevice(device.id)} className="flex-none text-[10px] font-bold text-foreground">
                    Sign Out
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex-none px-5" style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
        <Button variant="outline" onClick={signOutAllOthers} disabled={devices.length <= 1}>
          Sign Out All Other Devices
        </Button>
      </div>
    </div>
  );
}
