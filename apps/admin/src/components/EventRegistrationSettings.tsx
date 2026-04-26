"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@afc-sear/ui';
import { Plus, Trash2 } from 'lucide-react';
import type {
  PricingRuleState,
  RegistrationFieldState,
  RegistrationInventoryState,
  RegistrationPolicyState,
} from '@/lib/event-registration';
import { registrationChannelOptions } from '@/lib/event-registration';

interface EventRegistrationSettingsProps {
  fieldState: RegistrationFieldState;
  policyState: RegistrationPolicyState;
  inventoryState: RegistrationInventoryState[];
  onFieldStateChange: (next: RegistrationFieldState) => void;
  onPolicyStateChange: (next: RegistrationPolicyState) => void;
  onInventoryStateChange: (next: RegistrationInventoryState[]) => void;
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background p-4">
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
    </label>
  );
}

export function EventRegistrationSettings({
  fieldState,
  policyState,
  inventoryState,
  onFieldStateChange,
  onPolicyStateChange,
  onInventoryStateChange,
}: EventRegistrationSettingsProps) {
  const updateFieldState = (patch: Partial<RegistrationFieldState>) => {
    onFieldStateChange({ ...fieldState, ...patch });
  };

  const updatePolicyState = (patch: Partial<RegistrationPolicyState>) => {
    onPolicyStateChange({ ...policyState, ...patch });
  };

  const updateInventoryItem = (index: number, patch: Partial<RegistrationInventoryState>) => {
    onInventoryStateChange(inventoryState.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const updatePricingRule = (index: number, patch: Partial<PricingRuleState>) => {
    updatePolicyState({
      pricingRules: policyState.pricingRules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Registration Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="font-semibold text-foreground">Always collected</p>
            <p className="mt-1 text-sm text-muted-foreground">Full name is always required. Email is enabled by default because it helps with confirmations and follow-up.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleRow
              label="Require email address"
              hint="Useful when the event sends confirmations or updates."
              checked={fieldState.emailRequired}
              onChange={(checked) => updateFieldState({ emailRequired: checked })}
            />
            <ToggleRow
              label="Collect phone number"
              hint="Recommended for WhatsApp follow-up and self-service lookup."
              checked={fieldState.includePhone}
              onChange={(checked) =>
                updateFieldState({
                  includePhone: checked,
                  phoneRequired: checked ? fieldState.phoneRequired : false,
                })
              }
            />
            <ToggleRow
              label="Make phone number required"
              hint="Use this when the event depends on mobile contact."
              checked={fieldState.phoneRequired}
              onChange={(checked) => updateFieldState({ phoneRequired: checked, includePhone: checked || fieldState.includePhone })}
            />
            <ToggleRow
              label="Collect branch name"
              hint="Helpful for regional events and ministry reporting."
              checked={fieldState.includeBranchName}
              onChange={(checked) =>
                updateFieldState({
                  includeBranchName: checked,
                  branchRequired: checked ? fieldState.branchRequired : false,
                })
              }
            />
            <ToggleRow
              label="Make branch name required"
              hint="Use this when delegates must identify their assembly or branch."
              checked={fieldState.branchRequired}
              onChange={(checked) =>
                updateFieldState({ branchRequired: checked, includeBranchName: checked || fieldState.includeBranchName })
              }
            />
            <ToggleRow
              label="Collect age group"
              hint="Useful for youth, children, or audience-specific events."
              checked={fieldState.includeAgeGroup}
              onChange={(checked) =>
                updateFieldState({
                  includeAgeGroup: checked,
                  ageRequired: checked ? fieldState.ageRequired : false,
                })
              }
            />
            <ToggleRow
              label="Make age group required"
              hint="Use this when attendance depends on age or audience segment."
              checked={fieldState.ageRequired}
              onChange={(checked) => updateFieldState({ ageRequired: checked, includeAgeGroup: checked || fieldState.includeAgeGroup })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Registration Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Registration code prefix"
              value={policyState.codePrefix}
              onChange={(event) => updatePolicyState({ codePrefix: event.target.value.toUpperCase() })}
              placeholder="YTHCONF"
            />
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold tracking-tight text-muted-foreground">Supported channels</label>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-background p-3">
                {registrationChannelOptions.map((channel) => {
                  const active = policyState.supportedChannels.includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      onClick={() =>
                        updatePolicyState({
                          supportedChannels: active
                            ? policyState.supportedChannels.filter((item) => item !== channel)
                            : [...policyState.supportedChannels, channel],
                        })
                      }
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold tracking-tight text-muted-foreground">Payment deadline</label>
              <input
                type="datetime-local"
                value={policyState.paymentDeadline}
                onChange={(event) => updatePolicyState({ paymentDeadline: event.target.value })}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold tracking-tight text-muted-foreground">Cancellation deadline</label>
              <input
                type="datetime-local"
                value={policyState.cancellationDeadline}
                onChange={(event) => updatePolicyState({ cancellationDeadline: event.target.value })}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ToggleRow
              label="Require full payment before check-in"
              hint="Blocks check-in until the registration balance is cleared."
              checked={policyState.requireFullPaymentForCheckIn}
              onChange={(checked) => updatePolicyState({ requireFullPaymentForCheckIn: checked })}
            />
            <ToggleRow
              label="Allow waitlist"
              hint="Lets people join a waiting list when inventory fills up."
              checked={policyState.allowWaitlist}
              onChange={(checked) => updatePolicyState({ allowWaitlist: checked })}
            />
            <ToggleRow
              label="Allow self-service lookup"
              hint="Keeps future dashboard and lookup flows available to registrants."
              checked={policyState.allowSelfServiceLookup}
              onChange={(checked) => updatePolicyState({ allowSelfServiceLookup: checked })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Success heading"
              value={policyState.successHeading}
              onChange={(event) => updatePolicyState({ successHeading: event.target.value })}
              placeholder="Registration Received!"
            />
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-sm font-semibold tracking-tight text-muted-foreground">Success message</label>
              <textarea
                value={policyState.successMessage}
                onChange={(event) => updatePolicyState({ successMessage: event.target.value })}
                rows={3}
                className="w-full rounded-2xl border-2 border-input bg-background/50 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50"
                placeholder="We have received your registration for this event."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">Inventory and Accommodation</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Add rooms, dormitories, sections, or any limited-capacity option registrants can choose.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onInventoryStateChange([
                ...inventoryState,
                { category: '', name: '', capacity: '', isActive: true },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventoryState.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No inventory has been added yet. Leave this empty for simple ticket-only registration.
            </div>
          ) : null}

          {inventoryState.map((item, index) => (
            <div key={`${item.id || 'new'}-${index}`} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1.4fr_0.8fr_auto]">
                <Input
                  label="Category"
                  value={item.category}
                  onChange={(event) => updateInventoryItem(index, { category: event.target.value })}
                  placeholder="Dormitory"
                />
                <Input
                  label="Name"
                  value={item.name}
                  onChange={(event) => updateInventoryItem(index, { name: event.target.value })}
                  placeholder="Youth Camp"
                />
                <Input
                  label="Capacity"
                  type="number"
                  min="1"
                  value={item.capacity}
                  onChange={(event) => updateInventoryItem(index, { capacity: event.target.value })}
                  placeholder="88"
                />
                <div className="flex items-end justify-end gap-3 pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) => updateInventoryItem(index, { isActive: event.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    Active
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => onInventoryStateChange(inventoryState.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">Inventory Pricing Rules</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Add extra charges for accommodation or inventory selections by category or name.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              updatePolicyState({
                pricingRules: [...policyState.pricingRules, { inventoryCategory: '', inventoryName: '', amountMinor: '' }],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policyState.pricingRules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No inventory pricing rules yet. Use this when some spaces cost more than the base ticket.
            </div>
          ) : null}

          {policyState.pricingRules.map((rule, index) => (
            <div key={`${rule.inventoryCategory}-${rule.inventoryName}-${index}`} className="rounded-2xl border border-border bg-background p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto]">
                <Input
                  label="Inventory category"
                  value={rule.inventoryCategory}
                  onChange={(event) => updatePricingRule(index, { inventoryCategory: event.target.value })}
                  placeholder="Cottage"
                />
                <Input
                  label="Inventory name"
                  value={rule.inventoryName}
                  onChange={(event) => updatePricingRule(index, { inventoryName: event.target.value })}
                  placeholder="Southwind"
                />
                <Input
                  label="Extra amount (minor units)"
                  type="number"
                  min="0"
                  value={rule.amountMinor}
                  onChange={(event) => updatePricingRule(index, { amountMinor: event.target.value })}
                  placeholder="5000"
                />
                <div className="flex items-end justify-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() =>
                      updatePolicyState({
                        pricingRules: policyState.pricingRules.filter((_, ruleIndex) => ruleIndex !== index),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
