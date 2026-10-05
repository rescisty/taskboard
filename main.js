/* ==========================================================================
   TaskBoard — main.js
   Feature 1: Mobile nav toggle
   Feature 2: Data-driven creator cards (renders from CREATORS, filterable
              by search + category) — swap CREATORS for a fetch() to PHP later
   Feature 3: Commission request form validation
   Feature 4 (bonus): Scroll-reactive profile banner + portfolio reveal
   Feature 5: Scroll-linked text reveal on the home page (runs on Lenis)
   Feature 6: Live task cards on the home page + the Open Tasks page
   ========================================================================== */

var lenis = null;

document.addEventListener("DOMContentLoaded", function () {
    initLenis();
    initNavToggle();
    initCurrencySelector();
    initTaskPins();
    initTaskBoard();
    initCreatorGrids();
    initRequestForm();
    initProfileScrollEffects();
    initRoleToggle();
    initSignupForm();
    initLoginForm();
    initAuthNav();
    initScrollStory();
});

/* ---------- Fake "signed in" nav state ----------
   No back end yet, so this is simulated with localStorage. Once PHP
   sessions exist, replace isSignedIn()/signIn()/signOut() with real
   session checks and this nav logic stays the same. */
function isSignedIn() {
    return localStorage.getItem("tb_signed_in") === "1";
}

function signIn() {
    localStorage.setItem("tb_signed_in", "1");
}

function signOut() {
    localStorage.removeItem("tb_signed_in");
}

function initAuthNav() {
    var authLinks = document.querySelectorAll(".nav-auth-link");
    var accountLi = document.querySelector(".nav-account");
    var signedIn = isSignedIn();

    authLinks.forEach(function (li) {
        li.classList.toggle("is-hidden", signedIn);
    });

    if (accountLi) {
        accountLi.classList.toggle("is-visible", signedIn);
    }
}

/* ---------- Lenis smooth scroll ---------- */
function initLenis() {
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof Lenis === "undefined") return;

    lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true
    });

    // Lenis needs to be told to update on every animation frame —
    // this is what actually drives the eased scroll motion.
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

/* ---------- Feature 1: Mobile nav toggle ---------- */
function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        var expanded = nav.classList.contains("is-open");
        toggle.setAttribute("aria-expanded", expanded);
    });
}

/* ---------- Feature 2: Data-driven creator cards ---------- */
function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

/* ---------- Currency display ----------
   RATES lives in data.js (placeholder numbers for now — once the back end
   exists, an admin sets these and they come from a `currency_rates` table
   instead). Everything on screen stores/thinks in USD; this layer only
   changes what's displayed. */
function getCurrency() {
    return localStorage.getItem("tb_currency") || "USD";
}

function setCurrency(code) {
    localStorage.setItem("tb_currency", code);
}

function formatPrice(usd) {
    var code = getCurrency();
    var info = (typeof RATES !== "undefined" && RATES[code]) ? RATES[code] : { symbol: "$", rate: 1 };
    var converted = usd * info.rate;
    var rounded = converted >= 100 ? Math.round(converted) : Math.round(converted * 100) / 100;
    return info.symbol + rounded.toLocaleString();
}

// Wraps a price in a tagged span so changing currency can update every
// already-rendered price on the page without re-rendering whole components.
function priceSpan(usd) {
    return '<span class="price-value" data-usd="' + esc(usd) + '">' + formatPrice(usd) + '</span>';
}

function refreshDisplayedPrices() {
    var code = getCurrency();
    document.querySelectorAll(".currency-select").forEach(function (sel) {
        sel.value = code;
    });
    document.querySelectorAll(".price-value").forEach(function (el) {
        var usd = Number(el.getAttribute("data-usd"));
        if (!isNaN(usd)) el.textContent = formatPrice(usd);
    });
}

function initCurrencySelector() {
    var selects = document.querySelectorAll(".currency-select");
    if (!selects.length) return;

    selects.forEach(function (select) {
        select.value = getCurrency();
        select.addEventListener("change", function () {
            setCurrency(select.value);
            refreshDisplayedPrices();
        });
    });
}

function creatorCardMarkup(creator) {
    var statusLabel = creator.status === "open" ? "Open" : "Waitlist";
    var statusClass = creator.status === "open" ? "status-dot" : "status-dot closed";

    return (
        '<article class="creator-card" data-name="' + esc(creator.name) + '" data-category="' + esc(creator.category) + '">' +
            '<div class="creator-card__banner"></div>' +
            '<div class="creator-card__body">' +
                '<div class="creator-card__avatar"></div>' +
                '<h3 class="creator-card__name">' + esc(creator.name) + '</h3>' +
                '<p class="creator-card__category">' + esc(creator.categoryLabel) + '</p>' +
                '<p class="creator-card__bio">' + esc(creator.bio) + '</p>' +
                '<div class="creator-card__meta">' +
                    '<span>From ' + priceSpan(creator.price) + '</span>' +
                    '<span class="' + statusClass + '">' + statusLabel + '</span>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

function renderCreators(grid, list) {
    if (!grid) return;
    grid.innerHTML = list.map(creatorCardMarkup).join("");
}

function featuredCardMarkup(creator) {
    // Every featured creator links to the profile page template for now —
    // once profiles are dynamic, this becomes profile.php?id=<creator.id>.
    return (
        '<a class="featured-card" href="template.html">' +
            '<div class="featured-card__info">' +
                '<p class="featured-card__category">' + esc(creator.categoryLabel) + '</p>' +
                '<h3 class="featured-card__name">' + esc(creator.name) + '</h3>' +
                '<p class="featured-card__price">From ' + priceSpan(creator.price) + '</p>' +
            '</div>' +
        '</a>'
    );
}

/* ---------- Feature 6: Tasks (home page cards + Open Tasks page) ---------- */

function taskUrl(task) {
    return "tasks.html?task=" + encodeURIComponent(task.id);
}

function openTasks() {
    // newest first
    return TASKS
        .filter(function (t) { return t.status === "open"; })
        .sort(function (a, b) { return a.postedMinutes - b.postedMinutes; });
}

function timeAgo(minutes) {
    if (minutes < 60) return minutes + " min ago";
    if (minutes < 60 * 24) {
        var h = Math.round(minutes / 60);
        return h + (h === 1 ? " hour" : " hours") + " ago";
    }
    var d = Math.round(minutes / (60 * 24));
    return d + (d === 1 ? " day" : " days") + " ago";
}

function pinInner(task) {
    return (
        '<p class="tag">' + esc(task.categoryLabel) + '</p>' +
        '<h4>' + esc(task.title) + '</h4>' +
        '<p>Budget ' + priceSpan(task.budget) + ' &middot; ' + esc(task.due) + '</p>' +
        '<span class="pin-card__go" aria-hidden="true">View task &rarr;</span>'
    );
}

function fillPin(card, task) {
    card.href = taskUrl(task);
    card.innerHTML = pinInner(task);
}

// The pinned cards on the home page: real open tasks, each one a link to
// that task on the Open Tasks page. They swap for fresh ones every few
// seconds (paused while you hover/focus them) and drift with the pointer.
function initTaskPins() {
    var container = document.querySelector("[data-task-pins]");
    if (!container || typeof TASKS === "undefined") return;

    var pool = openTasks();
    if (pool.length === 0) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var slots = Math.min(3, pool.length);
    var cards = [];
    var shown = [];
    var nextIndex = slots;
    var nextSlot = 0;

    for (var i = 0; i < slots; i++) {
        var card = document.createElement("a");
        card.className = "pin-card pin-" + (i + 1);
        fillPin(card, pool[i]);
        container.appendChild(card);
        cards.push(card);
        shown.push(pool[i].id);
    }

    var counter = document.querySelector("[data-board-count]");
    if (counter) {
        counter.textContent = pool.length + (pool.length === 1 ? " open task" : " open tasks") + " right now";
    }

    if (reduceMotion) return;

    // ---- swap one card at a time ----
    var hovering = false;
    var inView = true;

    function swapNext() {
        if (hovering || !inView || document.hidden || pool.length <= slots) return;

        var slot = nextSlot;
        nextSlot = (nextSlot + 1) % slots;

        var task = null;
        for (var tries = 0; tries < pool.length; tries++) {
            var candidate = pool[nextIndex % pool.length];
            nextIndex++;
            if (shown.indexOf(candidate.id) === -1) { task = candidate; break; }
        }
        if (!task) return;

        var card = cards[slot];
        card.classList.add("is-leaving");

        window.setTimeout(function () {
            fillPin(card, task);
            shown[slot] = task.id;
            card.classList.remove("is-leaving");
            card.classList.add("is-entering");
            card.addEventListener("animationend", function done() {
                card.classList.remove("is-entering");
                card.removeEventListener("animationend", done);
            });
        }, 260);
    }

    window.setInterval(swapNext, 4500);

    container.addEventListener("mouseenter", function () { hovering = true; });
    container.addEventListener("mouseleave", function () { hovering = false; });
    container.addEventListener("focusin", function () { hovering = true; });
    container.addEventListener("focusout", function () { hovering = false; });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
        }).observe(container);
    }

    // ---- cards drift a little with the pointer (mouse devices only) ----
    if (window.matchMedia("(hover: hover)").matches) {
        var hero = container.closest(".hero") || container;
        var frame = null;
        var px = 0;
        var py = 0;

        hero.addEventListener("pointermove", function (e) {
            var r = hero.getBoundingClientRect();
            px = ((e.clientX - r.left) / r.width - 0.5) * 2;
            py = ((e.clientY - r.top) / r.height - 0.5) * 2;
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;
                container.style.setProperty("--mx", px.toFixed(3));
                container.style.setProperty("--my", py.toFixed(3));
            });
        });

        hero.addEventListener("pointerleave", function () {
            container.style.setProperty("--mx", 0);
            container.style.setProperty("--my", 0);
        });
    }
}

/* The Open Tasks page: a searchable, filterable list. Click a task to open
   its details. A link like tasks.html?task=102 opens and highlights that task. */
function taskCardMarkup(task) {
    var claimed = task.status === "claimed";
    return (
        '<article class="task-card' + (claimed ? ' is-claimed' : '') + '" id="task-' + esc(task.id) + '" data-task-id="' + esc(task.id) + '">' +
            '<button class="task-card__head" type="button" aria-expanded="false" aria-controls="task-' + esc(task.id) + '-details">' +
                '<span class="task-card__main">' +
                    '<span class="task-card__tag">' + esc(task.categoryLabel) + '</span>' +
                    '<span class="task-card__title">' + esc(task.title) + '</span>' +
                    '<span class="task-card__meta">Posted ' + esc(timeAgo(task.postedMinutes)) + ' &middot; Due in ' + esc(task.due) + '</span>' +
                '</span>' +
                '<span class="task-card__side">' +
                    '<span class="task-card__budget">' + priceSpan(task.budget) + '</span>' +
                    '<span class="badge ' + (claimed ? 'badge-done' : 'badge-open') + '">' + (claimed ? 'Claimed' : 'Open') + '</span>' +
                '</span>' +
                '<span class="task-card__chevron" aria-hidden="true"></span>' +
            '</button>' +
            '<div class="task-card__details" id="task-' + esc(task.id) + '-details">' +
                '<div class="task-card__details-inner">' +
                    '<p>' + esc(task.details) + '</p>' +
                    '<p class="task-card__by">Posted by ' + esc(task.postedBy) + '</p>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

function initTaskBoard() {
    var list = document.querySelector("[data-task-list]");
    if (!list || typeof TASKS === "undefined") return;

    var searchInput = document.querySelector(".search-input");
    var chips = document.querySelectorAll(".chip-filter");
    var sortSelect = document.querySelector("[data-task-sort]");
    var countEl = document.querySelector("[data-task-count]");
    var emptyState = document.querySelector(".empty-state");
    var activeCategory = "all";
    var expandedId = null;

    function filteredTasks() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var sort = sortSelect ? sortSelect.value : "newest";

        return TASKS.filter(function (task) {
            var haystack = (task.title + " " + task.details + " " + task.categoryLabel).toLowerCase();
            var matchesSearch = query === "" || haystack.indexOf(query) !== -1;
            var matchesCategory = activeCategory === "all" || task.category === activeCategory;
            return matchesSearch && matchesCategory;
        }).sort(function (a, b) {
            // open tasks first; claimed ones sink to the bottom
            if (a.status !== b.status) return a.status === "open" ? -1 : 1;
            if (sort === "budget") return b.budget - a.budget;
            return a.postedMinutes - b.postedMinutes;
        });
    }

    function setExpanded(card, expanded) {
        card.classList.toggle("is-expanded", expanded);
        card.querySelector(".task-card__head").setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    function render() {
        var tasks = filteredTasks();
        list.innerHTML = tasks.map(taskCardMarkup).join("");

        if (expandedId !== null) {
            var open = document.getElementById("task-" + expandedId);
            if (open) setExpanded(open, true);
        }

        var openCount = tasks.filter(function (t) { return t.status === "open"; }).length;
        if (countEl) {
            countEl.textContent = tasks.length === 0
                ? ""
                : tasks.length + (tasks.length === 1 ? " task" : " tasks") + " \u00b7 " + openCount + " open";
        }
        if (emptyState) emptyState.classList.toggle("is-visible", tasks.length === 0);
    }

    list.addEventListener("click", function (e) {
        var head = e.target.closest(".task-card__head");
        if (!head) return;
        var card = head.closest(".task-card");
        var willOpen = !card.classList.contains("is-expanded");

        list.querySelectorAll(".task-card.is-expanded").forEach(function (other) {
            setExpanded(other, false);
        });
        setExpanded(card, willOpen);
        expandedId = willOpen ? card.getAttribute("data-task-id") : null;
    });

    if (searchInput) searchInput.addEventListener("input", render);
    if (sortSelect) sortSelect.addEventListener("change", render);

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (c) { c.classList.remove("is-active"); });
            chip.classList.add("is-active");
            activeCategory = chip.getAttribute("data-category") || "all";
            render();
        });
    });

    // Arriving from a home-page card: open that task, scroll to it, flash it
    var wanted = new URLSearchParams(window.location.search).get("task");
    if (wanted !== null && TASKS.some(function (t) { return String(t.id) === wanted; })) {
        expandedId = wanted;
    }

    render();

    if (expandedId !== null) {
        var target = document.getElementById("task-" + expandedId);
        if (target) {
            target.classList.add("is-highlight");
            window.setTimeout(function () { target.classList.remove("is-highlight"); }, 2400);
            window.setTimeout(function () {
                var y = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 110;
                if (lenis) {
                    // the list was drawn after Lenis measured the page, so re-measure first
                    lenis.resize();
                    lenis.scrollTo(y);
                } else {
                    window.scrollTo({ top: y, behavior: "smooth" });
                }
            }, 200);
        }
    }
}

function initCreatorGrids() {
    if (typeof CREATORS === "undefined") return;

    var featuredGrid = document.querySelector('[data-featured-grid]');
    if (featuredGrid) {
        featuredGrid.innerHTML = CREATORS.slice(0, 3).map(featuredCardMarkup).join("");
    }

    var browseGrid = document.querySelector('[data-creator-grid="all"]');
    if (browseGrid) {
        initBrowseFilter(browseGrid);
    }
}

function initBrowseFilter(grid) {
    var searchInput = document.querySelector(".search-input");
    var chips = document.querySelectorAll(".chip-filter");
    var emptyState = document.querySelector(".empty-state");
    var activeCategory = "all";

    function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";

        var filtered = CREATORS.filter(function (creator) {
            var matchesSearch = query === "" || creator.name.toLowerCase().indexOf(query) !== -1;
            var matchesCategory = activeCategory === "all" || creator.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        renderCreators(grid, filtered);

        if (emptyState) {
            emptyState.classList.toggle("is-visible", filtered.length === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (c) { c.classList.remove("is-active"); });
            chip.classList.add("is-active");
            activeCategory = chip.getAttribute("data-category") || "all";
            applyFilters();
        });
    });

    applyFilters();
}

/* ---------- Feature 3: Request form validation ---------- */
function initRequestForm() {
    var form = document.querySelector(".request-form");
    if (!form) return;

    var successBox = document.querySelector(".form-success");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var isValid = true;

        var name = form.querySelector("#req-name");
        var email = form.querySelector("#req-email");
        var category = form.querySelector("#req-category");
        var budget = form.querySelector("#req-budget");
        var details = form.querySelector("#req-details");

        isValid = validateRequired(name, "Please enter your name.") && isValid;
        isValid = validateEmail(email) && isValid;
        isValid = validateRequired(category, "Please choose a category.") && isValid;
        isValid = validateBudget(budget) && isValid;
        isValid = validateRequired(details, "Tell us a bit about the task.") && isValid;

        if (isValid) {
            form.reset();
            if (successBox) {
                successBox.classList.add("is-visible");
                successBox.textContent = "Request received — once the back end is connected, this will save to the database and notify a creator.";
                successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }
    });
}

function fieldWrapper(input) {
    return input ? input.closest(".field") : null;
}

function setError(input, message) {
    var wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.add("has-error");
    var errorEl = wrapper.querySelector(".field-error");
    if (errorEl && message) errorEl.textContent = message;
}

function clearError(input) {
    var wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.remove("has-error");
}

function validateRequired(input, message) {
    if (!input) return true;
    if (input.value.trim() === "") {
        setError(input, message);
        return false;
    }
    clearError(input);
    return true;
}

function validateEmail(input) {
    if (!input) return true;
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input.value.trim() === "") {
        setError(input, "Please enter your email.");
        return false;
    }
    if (!pattern.test(input.value.trim())) {
        setError(input, "Please enter a valid email address.");
        return false;
    }
    clearError(input);
    return true;
}

function validateBudget(input) {
    if (!input) return true;
    var value = input.value.trim();
    if (value === "") {
        setError(input, "Please enter a budget.");
        return false;
    }
    var num = Number(value);
    if (isNaN(num) || num <= 0) {
        setError(input, "Budget must be a positive number.");
        return false;
    }
    clearError(input);
    return true;
}

/* ---------- Signup: role toggle (client vs creator) ---------- */
function initRoleToggle() {
    var options = document.querySelectorAll(".role-option");
    if (!options.length) return;

    options.forEach(function (option) {
        var input = option.querySelector("input");
        option.addEventListener("click", function () {
            options.forEach(function (o) { o.classList.remove("is-selected"); });
            option.classList.add("is-selected");
            if (input) input.checked = true;
        });
    });
}

/* ---------- Login form validation ---------- */
function initLoginForm() {
    var form = document.querySelector(".login-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var isValid = true;

        var email = form.querySelector("#login-email");
        var password = form.querySelector("#login-password");

        isValid = validateEmail(email) && isValid;
        isValid = validateRequired(password, "Please enter your password.") && isValid;

        if (isValid) {
            // Back end will check credentials against the database here.
            signIn();
            window.location.href = "browse.html";
        }
    });
}

/* ---------- Signup form validation ---------- */
function initSignupForm() {
    var form = document.querySelector(".signup-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var isValid = true;

        var name = form.querySelector("#signup-name");
        var email = form.querySelector("#signup-email");
        var password = form.querySelector("#signup-password");
        var tos = form.querySelector("#signup-tos");
        var tosError = document.getElementById("tos-error");
        var selectedRole = form.querySelector('input[name="role"]:checked');

        isValid = validateRequired(name, "Please enter your name.") && isValid;
        isValid = validateEmail(email) && isValid;

        if (!password || password.value.length < 8) {
            setError(password, "Password must be at least 8 characters.");
            isValid = false;
        } else {
            clearError(password);
        }

        if (!tos || !tos.checked) {
            if (tosError) tosError.classList.add("is-visible");
            isValid = false;
        } else if (tosError) {
            tosError.classList.remove("is-visible");
        }

        if (isValid) {
            // Back end will create the account here and redirect based on role.
            signIn();
            var role = selectedRole ? selectedRole.value : "client";
            if (role === "creator") {
                window.location.href = "creator-setup.html";
            } else {
                window.location.href = "browse.html";
            }
        }
    });
}

/* ---------- Feature 4 (bonus): Profile banner + portfolio reveal ---------- */
function initProfileScrollEffects() {
    var banner = document.querySelector(".profile-banner");
    if (banner) {
        // The banner keeps its size and its artwork drifts slower than the
        // page. (Shrinking its height used to shift the whole page and made
        // scrolling feel jumpy.)
        var updateBanner = function (scrollY) {
            banner.style.setProperty("--shift", Math.min(Math.max(scrollY, 0), 240) * 0.4);
        };

        if (lenis) {
            lenis.on("scroll", function (e) {
                updateBanner(e.scroll);
            });
        } else {
            window.addEventListener("scroll", function () {
                updateBanner(window.scrollY || window.pageYOffset);
            }, { passive: true });
        }
    }

    var portfolioCards = document.querySelectorAll(".portfolio-card");
    if (portfolioCards.length && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                }
            });
        }, { threshold: 0.2 });

        portfolioCards.forEach(function (card) {
            observer.observe(card);
        });
    } else {
        portfolioCards.forEach(function (card) {
            card.classList.add("is-visible");
        });
    }
}

/* ---------- Feature 5: Scroll-linked text reveal (home page) ---------- */
function initScrollStory() {
    var section = document.querySelector("[data-scroll-story]");
    var text = document.querySelector("[data-scroll-text]");
    if (!section || !text) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // data-highlights="art:coral,code:sage" -> which words get a painted swatch
    var tones = {};
    (text.getAttribute("data-highlights") || "").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts[0] && parts[1]) tones[parts[0].trim().toLowerCase()] = parts[1].trim();
    });

    // Split the sentence into words so each one can reveal on its own
    var original = text.textContent.trim();
    text.setAttribute("aria-label", original);
    text.textContent = "";

    var words = original.split(/\s+/).map(function (w) {
        var span = document.createElement("span");
        span.className = "word";
        span.setAttribute("aria-hidden", "true");
        span.textContent = w;
        var tone = tones[w.toLowerCase().replace(/[^a-z]/g, "")];
        if (tone) span.className += " hl hl-" + tone;
        text.appendChild(span);
        return span;
    });

    // little sparkle at the end of the sentence that turns as it appears
    var glyph = document.createElement("span");
    glyph.className = "word glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.9 6.6 4.9 11.1 12 12-7.1.9-11.1 5.4-12 12-.9-6.6-4.9-11.1-12-12C7.1 11.1 11.1 6.6 12 0z"/></svg>';
    text.appendChild(glyph);
    words.push(glyph);

    if (reduceMotion) return;

    var REVEAL_END = 0.72; // text is fully shown by 72% and then holds before the section scrolls away
    var collapsed = false;

    function clamp(n) { return Math.min(1, Math.max(0, n)); }
    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    // p = 0 (nothing shown) ... 1 (everything shown)
    function paint(p) {
        section.style.setProperty("--p", p.toFixed(4));
        var reveal = clamp(p / REVEAL_END) * (words.length + 3);

        words.forEach(function (word, i) {
            var t = ease(clamp((reveal - i) / 3));
            word.style.setProperty("--t", t.toFixed(3));
            word.style.opacity = (0.16 + t * 0.84).toFixed(3);
            word.style.transform = "translateY(" + ((1 - t) * 16).toFixed(1) + "px)";
        });
    }

    // Removing height above the viewport pulls everything up, so scroll by the
    // same amount to keep what's on screen exactly where it was.
    function collapse() {
        paint(1);

        // read positions BEFORE the layout changes (the browser clamps scrollY
        // the moment the page gets shorter)
        var yBefore = window.scrollY || window.pageYOffset;
        var gliding = lenis && lenis.isScrolling === "smooth";
        var destination = lenis ? lenis.targetScroll : 0;
        var heightBefore = section.offsetHeight;

        section.classList.add("is-collapsed");
        collapsed = true;

        var delta = heightBefore - section.offsetHeight;

        if (lenis) {
            lenis.resize();
            lenis.scrollTo(yBefore - delta, { immediate: true, force: true });
            // if the visitor was mid-flick, keep gliding to where they were headed
            if (gliding) lenis.scrollTo(destination - delta, { force: true, duration: 0.7 });
        } else {
            window.scrollTo(0, yBefore - delta);
        }
    }

    function expand() {
        // fade the words back to their dim starting state instead of snapping
        section.classList.add("is-rearming");
        window.setTimeout(function () { section.classList.remove("is-rearming"); }, 450);

        section.classList.remove("is-collapsed");
        collapsed = false;
        paint(0);
    }

    function update() {
        var rect = section.getBoundingClientRect();

        // Scrolled past it: drop the extra height, so coming back UP is a normal scroll
        if (!collapsed && rect.bottom < -40) {
            collapse();
            return;
        }

        if (collapsed) {
            // Re-arm once the text has slid down to the bottom edge of the screen,
            // so the next trip DOWN plays it from the start.
            if (text.getBoundingClientRect().top > window.innerHeight * 0.8) expand();
            else return;
        }

        var scrollable = rect.height - window.innerHeight;
        paint(scrollable > 0 ? clamp(-rect.top / scrollable) : 1);
    }

    // Lenis scrolls the real window, so the native scroll event stays in sync
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
}
