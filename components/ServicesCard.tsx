"use client";

import { useState } from "react";
import { Shirt } from "lucide-react";
import { Card, StatusBadge, selectClass } from "@/components/Shell";
import { services, type ServiceOrder } from "@/lib/store";
import { useCollection } from "@/lib/useCollection";

export function ServicesCard() {
    const { items: orders, error, createItem } = useCollection<ServiceOrder>("orders");
    const [serviceId, setServiceId] = useState<string>(services[0].id);
    const [qty, setQty] = useState(1);

    const service = services.find((s) => s.id === serviceId)!;
    const mine = orders;

    async function order(e: React.FormEvent) {
        e.preventDefault();
        if (await createItem({ serviceId, qty })) setQty(1);
    }

    return (
        <Card title="Laundry & cleaning" icon={Shirt}>
            <form onSubmit={order} className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Service</label>
                    <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={`${selectClass} block`}>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} · ₦{s.price.toLocaleString()} {s.unit}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Qty</label>
                    <input type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className={`${selectClass} block w-20`} />
                </div>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Order · ₦{(service.price * qty).toLocaleString()}
                </button>
            </form>
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <p className="mt-2 text-xs text-muted-foreground">The cost is added to your hostel bill.</p>

            {mine.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {mine.map((o) => (
                        <li key={o.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                            <div>
                                <p className="text-sm font-medium">{o.service} × {o.qty}</p>
                                <p className="text-xs text-muted-foreground">₦{o.total.toLocaleString()} · {o.date}</p>
                            </div>
                            <StatusBadge status={o.status} />
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
