export type RegistrationChannelOption = 'WEB' | 'WHATSAPP' | 'ADMIN';

export interface RegistrationFieldState {
  emailRequired: boolean;
  includePhone: boolean;
  phoneRequired: boolean;
  includeBranchName: boolean;
  branchRequired: boolean;
  includeAgeGroup: boolean;
  ageRequired: boolean;
}

export interface PricingRuleState {
  inventoryCategory: string;
  inventoryName: string;
  amountMinor: string;
}

export interface RegistrationPolicyState {
  codePrefix: string;
  paymentDeadline: string;
  cancellationDeadline: string;
  requireFullPaymentForCheckIn: boolean;
  allowWaitlist: boolean;
  allowSelfServiceLookup: boolean;
  supportedChannels: RegistrationChannelOption[];
  successHeading: string;
  successMessage: string;
  pricingRules: PricingRuleState[];
}

export interface RegistrationInventoryState {
  id?: string;
  category: string;
  name: string;
  capacity: string;
  isActive: boolean;
}

export const registrationChannelOptions: RegistrationChannelOption[] = ['WEB', 'WHATSAPP', 'ADMIN'];

function toLocalDateTime(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function toCodePrefix(title: string, slug: string) {
  const base = (slug || title || 'EVENT').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  const compact = base
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 3))
    .join('')
    .slice(0, 10);
  return compact || 'EVENT';
}

export function createDefaultRegistrationFieldState(eventType = 'SERVICE'): RegistrationFieldState {
  const isConference = eventType === 'CONFERENCE';
  return {
    emailRequired: true,
    includePhone: isConference,
    phoneRequired: isConference,
    includeBranchName: isConference,
    branchRequired: false,
    includeAgeGroup: isConference,
    ageRequired: false,
  };
}

export function createDefaultRegistrationPolicyState(input: {
  eventType?: string;
  title?: string;
  slug?: string;
}): RegistrationPolicyState {
  const isConference = input.eventType === 'CONFERENCE';

  return {
    codePrefix: toCodePrefix(input.title || '', input.slug || ''),
    paymentDeadline: '',
    cancellationDeadline: '',
    requireFullPaymentForCheckIn: isConference,
    allowWaitlist: isConference,
    allowSelfServiceLookup: true,
    supportedChannels: [...registrationChannelOptions],
    successHeading: 'Registration Received!',
    successMessage: 'We have received your registration for this event.',
    pricingRules: [],
  };
}

export function registrationFieldStateFromSchema(schema: any, eventType = 'SERVICE'): RegistrationFieldState {
  const defaults = createDefaultRegistrationFieldState(eventType);
  const fields = Array.isArray(schema?.fields) ? schema.fields : [];
  const hasField = (key: string) => fields.find((field: any) => field?.key === key);

  return {
    emailRequired: hasField('email')?.required ?? defaults.emailRequired,
    includePhone: Boolean(hasField('phone')),
    phoneRequired: hasField('phone')?.required ?? defaults.phoneRequired,
    includeBranchName: Boolean(hasField('branchName')),
    branchRequired: hasField('branchName')?.required ?? defaults.branchRequired,
    includeAgeGroup: Boolean(hasField('ageGroup')),
    ageRequired: hasField('ageGroup')?.required ?? defaults.ageRequired,
  };
}

export function registrationFieldStateToSchema(state: RegistrationFieldState) {
  const fields = [{ key: 'fullName', label: 'Full Name', type: 'text', required: true }];

  fields.push({ key: 'email', label: 'Email Address', type: 'email', required: state.emailRequired });

  if (state.includePhone) {
    fields.push({ key: 'phone', label: 'Phone Number', type: 'tel', required: state.phoneRequired });
  }

  if (state.includeBranchName) {
    fields.push({ key: 'branchName', label: 'Branch', type: 'text', required: state.branchRequired });
  }

  if (state.includeAgeGroup) {
    fields.push({ key: 'ageGroup', label: 'Age Group', type: 'text', required: state.ageRequired });
  }

  return { fields };
}

export function registrationPolicyStateFromApi(
  policy: any,
  input: {
    eventType?: string;
    title?: string;
    slug?: string;
  }
): RegistrationPolicyState {
  const defaults = createDefaultRegistrationPolicyState(input);
  return {
    codePrefix: policy?.codePrefix || defaults.codePrefix,
    paymentDeadline: toLocalDateTime(policy?.paymentDeadline),
    cancellationDeadline: toLocalDateTime(policy?.cancellationDeadline),
    requireFullPaymentForCheckIn:
      policy?.requireFullPaymentForCheckIn ?? defaults.requireFullPaymentForCheckIn,
    allowWaitlist: policy?.allowWaitlist ?? defaults.allowWaitlist,
    allowSelfServiceLookup: policy?.allowSelfServiceLookup ?? defaults.allowSelfServiceLookup,
    supportedChannels:
      Array.isArray(policy?.supportedChannels) && policy.supportedChannels.length > 0
        ? policy.supportedChannels
        : defaults.supportedChannels,
    successHeading: policy?.confirmationConfig?.successHeading || defaults.successHeading,
    successMessage: policy?.confirmationConfig?.successMessage || defaults.successMessage,
    pricingRules: Array.isArray(policy?.pricingRules)
      ? policy.pricingRules.map((rule: any) => ({
          inventoryCategory: rule.inventoryCategory || '',
          inventoryName: rule.inventoryName || '',
          amountMinor: rule.amountMinor !== undefined ? String(rule.amountMinor) : '',
        }))
      : defaults.pricingRules,
  };
}

export function registrationPolicyStateToApi(state: RegistrationPolicyState) {
  return {
    codePrefix: state.codePrefix.trim(),
    paymentDeadline: state.paymentDeadline ? new Date(state.paymentDeadline).toISOString() : null,
    cancellationDeadline: state.cancellationDeadline ? new Date(state.cancellationDeadline).toISOString() : null,
    requireFullPaymentForCheckIn: state.requireFullPaymentForCheckIn,
    allowWaitlist: state.allowWaitlist,
    allowSelfServiceLookup: state.allowSelfServiceLookup,
    supportedChannels: state.supportedChannels,
    pricingRules: state.pricingRules
      .filter((rule) => rule.inventoryCategory.trim() || rule.inventoryName.trim())
      .map((rule) => ({
        inventoryCategory: rule.inventoryCategory.trim() || undefined,
        inventoryName: rule.inventoryName.trim() || undefined,
        amountMinor: Number(rule.amountMinor || 0),
      })),
    confirmationConfig: {
      successHeading: state.successHeading.trim() || 'Registration Received!',
      successMessage: state.successMessage.trim() || 'We have received your registration for this event.',
    },
  };
}

export function registrationInventoryStateFromApi(inventory: any[] | undefined): RegistrationInventoryState[] {
  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory.map((item) => ({
    id: item.id,
    category: item.category || '',
    name: item.name || '',
    capacity: item.capacity !== undefined ? String(item.capacity) : '',
    isActive: item.isActive !== false,
  }));
}

export function registrationInventoryStateToApi(inventory: RegistrationInventoryState[]) {
  return inventory
    .filter((item) => item.category.trim() && item.name.trim() && Number(item.capacity) > 0)
    .map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      category: item.category.trim(),
      name: item.name.trim(),
      capacity: Number(item.capacity),
      isActive: item.isActive,
    }));
}

export function applyConferenceRegistrationDefaults(input: {
  title?: string;
  slug?: string;
}) {
  return {
    fields: createDefaultRegistrationFieldState('CONFERENCE'),
    policy: createDefaultRegistrationPolicyState({
      eventType: 'CONFERENCE',
      title: input.title,
      slug: input.slug,
    }),
  };
}
