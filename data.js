/* ==========================================================================
   TaskBoard — creator data
   Placeholder array standing in for the database. Once the back end exists,
   replace CREATORS with a fetch() call to a PHP endpoint that returns the
   same shape of objects, and the rendering code in main.js won't need to change.
   ========================================================================== */

/* Open task requests — what a client posts on the "leave a task, any
   creator can claim it" side of the board. Separate from CREATORS since
   a task isn't tied to one person until a creator picks it up.
   Later: replace this with a fetch() to a PHP endpoint reading the
   `requests` table, most recent / open ones first. */
const TASKS = [
    {
        id: 101,
        category: "coding",
        categoryLabel: "Coding",
        title: "Fix checkout bug",
        budget: 80,
        meta: "2 days",
        status: "open"
    },
    {
        id: 102,
        category: "art",
        categoryLabel: "Illustration",
        title: "Character sheet",
        budget: 150,
        meta: "open",
        status: "open"
    },
    {
        id: 103,
        category: "editing",
        categoryLabel: "Editing",
        title: "Trim podcast ep.",
        budget: 45,
        meta: "claimed",
        status: "claimed"
    },
    {
        id: 104,
        category: "writing",
        categoryLabel: "Writing",
        title: "Product descriptions",
        budget: 35,
        meta: "open",
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
