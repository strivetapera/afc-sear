export const fallbackLocationsMetadata = {
    eyebrow: 'Locations',
    title: 'Zimbabwe Branch Directory',
    lead: 'This directory carries forward restored Zimbabwe branch information while broader regional location data continues to be verified and added carefully.',
};
export const fallbackLocationsOverview = {
    intro: 'The current platform fallback preserves a usable Zimbabwe directory view so visitors can still find the Harare assembly and understand the wider branch footprint under restoration.',
    contactPrompt: 'If you do not yet see your nearest congregation outside Zimbabwe, use the Contact page and we will help route you while the larger regional directory is expanded.',
};
export const fallbackLocationsContacts = [
    {
        id: 'harare-address',
        label: 'Harare Assembly',
        value: 'Stand 10466, Lusaka, Highfields',
        note: 'This address was preserved from the legacy Zimbabwe branch directory.',
    },
    {
        id: 'visitor-support-whatsapp',
        label: 'Visitor Support WhatsApp',
        value: '+263 771 400 856',
        href: 'https://wa.me/263771400856',
        note: 'Legacy visitor and prayer-request WhatsApp contact carried over from the previous website.',
    },
];
export const fallbackLocationsGroups = [
    {
        country: 'Zimbabwe',
        locations: [
            {
                id: 'branch-harare-001',
                country: 'Zimbabwe',
                city: 'Harare',
                congregation: 'Harare Assembly',
                address: 'Stand 10466, Lusaka, Highfields',
                serviceTimes: [
                    'Sunday School - 9:00 AM',
                    'Sunday Devotional Service - 10:30 AM',
                    'Tuesday Evangelical Service - 6:00 PM',
                    'Friday Bible Teaching - 6:00 PM',
                ],
                contact: 'Use the Contact page for an introduction to this branch.',
                pastor: 'N Jaravani',
                notes: 'This branch entry was preserved from the legacy Zimbabwe church directory.',
                livestream: true,
            },
        ],
    },
];
export const fallbackLocationsDirectory = {
    metadata: fallbackLocationsMetadata,
    overview: fallbackLocationsOverview,
    contacts: fallbackLocationsContacts,
    groupedLocations: fallbackLocationsGroups,
};
//# sourceMappingURL=locations-fallback.js.map