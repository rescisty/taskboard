/* ==========================================================================
   TaskBoard — creator data
   Placeholder array standing in for the database. Once the back end exists,
   replace CREATORS with a fetch() call to a PHP endpoint that returns the
   same shape of objects, and the rendering code in main.js won't need to change.
   ========================================================================== */

/* Currency conversion rates, USD as the base (every price in CREATORS/TASKS
   is stored in USD). These numbers are placeholders for the demo — once the
   back end exists, an admin sets these from a dashboard and they'll come
   from a `currency_rates` table instead, with `users.preferred_currency`
   remembering each logged-in user's choice server-side instead of just
   in this browser's localStorage. */
const RATES = {
    USD: { symbol: "$", rate: 1 },
    PHP: { symbol: "\u20b1", rate: 58.5 },
    EUR: { symbol: "\u20ac", rate: 0.92 }
};

/* Task requests — what a client posts on the "leave a task, any creator can
   claim it" side of the board. Separate from CREATORS since a task isn't tied
   to one person until a creator picks it up.
   Later: replace this with a fetch() to a PHP endpoint reading the `requests`
   table (same field names). postedMinutes is "how long ago" so the page can
   show "12 min ago" / "3 hours ago" without storing a pre-formatted string. */
const TASKS = [
    {
        id: 101,
        category: "coding",
        categoryLabel: "Coding",
        title: "Fix checkout bug",
        details: "The Pay button on our shop's checkout page stops responding in Safari. Looking for someone to track it down and fix it. Plain JavaScript, no framework.",
        budget: 80,
        due: "2 days",
        postedBy: "Jane C.",
        postedMinutes: 12,
        status: "open"
    },
    {
        id: 102,
        category: "art",
        categoryLabel: "Illustration",
        title: "Character sheet",
        details: "Full-body front and back character sheet for a tabletop campaign. I'll share a moodboard and a short written description of the character.",
        budget: 150,
        due: "5 days",
        postedBy: "Marco D.",
        postedMinutes: 35,
        status: "open"
    },
    {
        id: 103,
        category: "writing",
        categoryLabel: "Writing",
        title: "Product descriptions",
        details: "Twelve short product descriptions (about 60 words each) for a small ceramics shop. Warm, simple tone. I'll send photos and materials for each piece.",
        budget: 35,
        due: "3 days",
        postedBy: "Aiko T.",
        postedMinutes: 70,
        status: "open"
    },
    {
        id: 104,
        category: "audio",
        categoryLabel: "Audio & Music",
        title: "Podcast intro jingle",
        details: "A 10 to 15 second intro jingle for a weekly cooking podcast. Upbeat and acoustic, something you could hum. Two rounds of revisions included.",
        budget: 60,
        due: "1 week",
        postedBy: "Sam R.",
        postedMinutes: 95,
        status: "open"
    },
    {
        id: 105,
        category: "editing",
        categoryLabel: "Editing",
        title: "Trim podcast ep.",
        details: "Cut a 50 minute podcast episode down to about 35. Remove long pauses and tangents, keep the interview intact.",
        budget: 45,
        due: "1 day",
        postedBy: "Lea M.",
        postedMinutes: 190,
        status: "claimed"
    },
    {
        id: 106,
        category: "design",
        categoryLabel: "Design",
        title: "Cafe menu redesign",
        details: "Refresh a one-page A4 menu: cleaner layout, better type, room for a small illustration. I have the text and logo ready.",
        budget: 120,
        due: "10 days",
        postedBy: "Nico P.",
        postedMinutes: 240,
        status: "open"
    },
    {
        id: 107,
        category: "3d",
        categoryLabel: "3D & Rigging",
        title: "Rig a low-poly fox",
        details: "I have a finished low-poly fox model. It needs a simple rig for a game: legs, tail and head, plus idle and run cycles.",
        budget: 140,
        due: "2 weeks",
        postedBy: "Dee K.",
        postedMinutes: 420,
        status: "open"
    },
    {
        id: 108,
        category: "coding",
        categoryLabel: "Coding",
        title: "Landing page from a Figma file",
        details: "Turn a finished one-page Figma design into responsive HTML and CSS. Hand-written code preferred, no page builders.",
        budget: 180,
        due: "6 days",
        postedBy: "Ravi S.",
        postedMinutes: 900,
        status: "open"
    },
    {
        id: 109,
        category: "editing",
        categoryLabel: "Video Editing",
        title: "Wedding highlight reel",
        details: "A 3 minute highlight reel from about two hours of footage. Soft colors, licensed music supplied by us.",
        budget: 200,
        due: "1 week",
        postedBy: "Hana L.",
        postedMinutes: 1500,
        status: "claimed"
    },
    {
        id: 110,
        category: "writing",
        categoryLabel: "Writing & Journalism",
        title: "Blog post on remote work",
        details: "A 900 word blog post with practical tips for staying focused while working from home. Friendly, not preachy.",
        budget: 40,
        due: "2 days",
        postedBy: "Omar F.",
        postedMinutes: 2900,
        status: "open"
    }
];

const CREATORS = [
    {
        id: 1,
        name: "Mira Solano",
        category: "art",
        categoryLabel: "Illustration",
        bio: "Character sheets and concept art, usually 3–5 day turnaround.",
        price: 25,
        status: "open"
    },
    {
        id: 2,
        name: "Devon Cruz",
        category: "coding",
        categoryLabel: "Web Development",
        bio: "Front-end fixes, small features, and bug squashing.",
        price: 60,
        status: "open"
    },
    {
        id: 3,
        name: "Ana Reyes",
        category: "editing",
        categoryLabel: "Video Editing",
        bio: "Podcast trims, short-form cuts, and color correction.",
        price: 35,
        status: "waitlist"
    },
    {
        id: 4,
        name: "Kian Oh",
        category: "3d",
        categoryLabel: "3D & Rigging",
        bio: "Character rigs and walk cycles for games and animation.",
        price: 90,
        status: "open"
    },
    {
        id: 5,
        name: "Priya Nair",
        category: "writing",
        categoryLabel: "Writing & Journalism",
        bio: "Articles, copy, and long-form research writing.",
        price: 20,
        status: "open"
    },
    {
        id: 6,
        name: "Jonas Bekker",
        category: "audio",
        categoryLabel: "Audio & Music",
        bio: "Mixing, mastering, and short original compositions.",
        price: 40,
        status: "open"
    },
    {
        id: 7,
        name: "Lena Fischer",
        category: "design",
        categoryLabel: "Design",
        bio: "Branding, UI kits, and presentation decks.",
        price: 55,
        status: "waitlist"
    },
    {
        id: 8,
        name: "Marcus Webb",
        category: "coding",
        categoryLabel: "App Development",
        bio: "Small mobile app builds and API integrations.",
        price: 75,
        status: "open"
    },
    {
        id: 9,
        name: "Soo-ah Park",
        category: "art",
        categoryLabel: "Digital Painting",
        bio: "Environment concept art and matte painting.",
        price: 45,
        status: "open"
    },
    {
        id: 10,
        name: "Theo Marin",
        category: "editing",
        categoryLabel: "Photo Retouching",
        bio: "Portrait retouching and product photo cleanup.",
        price: 18,
        status: "open"
    }
];
