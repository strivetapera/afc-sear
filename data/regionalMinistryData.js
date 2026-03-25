import { 
  legacyZimbabweWebcast, 
  legacyPrayerContacts 
} from './legacyZimbabweSiteData';

/**
 * Regional Ministry Data
 * This file serves as the unified source of truth for the Southern & Eastern Africa Region.
 * It maps legacy site data to the new regional platform structure.
 */

export const regionalWebcastDetails = {
    ...legacyZimbabweWebcast,
    // Add any regional overrides here if necessary
};

export const regionalPrayerContacts = [
    ...legacyPrayerContacts,
    // Add any additional regional contacts here
];
