'use client';
import { Check, Minus } from 'lucide-react';
import { MEMBERSHIP_COMPARISON_CATEGORIES } from '@/data/mockData';
import { MembershipPlanItem } from '@/types';

interface ComparisonTableProps {
  plans: MembershipPlanItem[];
  annual: boolean;
  onSelectPlan: (plan: MembershipPlanItem) => void;
}

export default function MembershipComparisonTable({
  plans,
  annual,
  onSelectPlan,
}: ComparisonTableProps) {
  const renderValue = (val: string | boolean) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
          <Check className="w-4 h-4" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="text-muted-foreground/40 font-mono">
          <Minus className="w-4 h-4 inline-block" />
        </span>
      );
    }
    return <span className="text-xs font-medium text-foreground">{val}</span>;
  };

  return (
    <div className="w-full">
      <div className="relative border border-border/80 bg-card overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          {/* Sticky Header */}
          <thead>
            <tr className="border-b border-border/80 bg-background/95 backdrop-blur-md">
              <th className="sticky left-0 top-0 z-40 bg-background/95 backdrop-blur-md p-5 min-w-[220px] text-xs uppercase tracking-wider text-muted-foreground font-semibold border-r border-border/60">
                Tier Comparison
              </th>
              {plans.map((p) => {
                const isElite = p.best_offer || p.id === 'tier-elite';
                const price = annual ? p.price_annual : p.price_monthly;
                return (
                  <th
                    key={p.id}
                    className={`p-5 text-center min-w-[135px] align-top transition-colors ${
                      isElite ? 'bg-primary/5 border-x border-primary/30' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {isElite && (
                        <span className="text-[0.55rem] uppercase tracking-widest text-primary font-bold bg-primary/20 px-2 py-0.5 mb-1.5 border border-primary/40">
                          Best Offer
                        </span>
                      )}
                      <span className="font-heading text-base text-foreground font-bold">{p.name}</span>
                      <span className="font-mono text-sm font-semibold text-primary mt-1">
                        ${price}/mo
                      </span>
                      <button
                        onClick={() => onSelectPlan(p)}
                        className={`mt-2.5 px-3 py-1.5 text-[0.62rem] uppercase tracking-wider font-semibold transition-colors ${
                          isElite
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'border border-border text-foreground hover:border-primary hover:text-primary'
                        }`}
                      >
                        Join
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body with Categorized Rows */}
          <tbody className="divide-y divide-border/40">
            {MEMBERSHIP_COMPARISON_CATEGORIES.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Section Header */}
                <tr className="bg-secondary/40">
                  <td
                    colSpan={5}
                    className="sticky left-0 z-20 bg-secondary/60 backdrop-blur-sm px-5 py-3 text-[0.68rem] uppercase tracking-ultra text-primary font-semibold"
                  >
                    {cat.category}
                  </td>
                </tr>

                {/* Items */}
                {cat.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="hover:bg-secondary/20 transition-colors">
                    {/* Pinned first column */}
                    <td className="sticky left-0 z-20 bg-card p-4 text-xs font-medium text-foreground border-r border-border/60">
                      {item.name}
                    </td>
                    <td className="p-4 text-center">{renderValue(item.essential)}</td>
                    <td className="p-4 text-center">{renderValue(item.plus)}</td>
                    <td className="p-4 text-center bg-primary/[0.02] border-x border-primary/20 font-semibold">
                      {renderValue(item.elite)}
                    </td>
                    <td className="p-4 text-center">{renderValue(item.blackCard)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';

