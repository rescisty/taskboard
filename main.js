/* ==========================================================================
   TaskBoard — main.js
   Feature 1: Mobile nav toggle
   Feature 2: Data-driven creator cards (renders from CREATORS, filterable
              by search + category) — swap CREATORS for a fetch() to PHP later
   Feature 3: Commission request form validation
   Feature 4 (bonus): Scroll-reactive profile banner + portfolio reveal
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initCreatorGrids();
    initRequestForm();
    initProfileScrollEffects();
});

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
function creatorCardMarkup(creator) {
    var statusLabel = creator.status === "open" ? "Open" : "Waitlist";
    var statusClass = creator.status === "open" ? "status-dot" : "status-dot closed";

    return (
        '<article class="creator-card" data-name="' + creator.name + '" data-category="' + creator.category + '">' +
            '<div class="creator-card__banner"></div>' +
            '<div class="creator-card__body">' +
                '<div class="creator-card__avatar"></div>' +
                '<h3 class="creator-card__name">' + creator.name + '</h3>' +
                '<p class="creator-card__category">' + creator.categoryLabel + '</p>' +
                '<p class="creator-card__bio">' + creator.bio + '</p>' +
                '<div class="creator-card__meta">' +
                    '<span>From $' + creator.price + '</span>' +
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

function initCreatorGrids() {
    if (typeof CREATORS === "undefined") return;

    var featuredGrid = document.querySelector('[data-creator-grid="featured"]');
    if (featuredGrid) {
        renderCreators(featuredGrid, CREATORS.slice(0, 4));
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

/* ---------- Feature 4 (bonus): Profile banner + portfolio reveal ---------- */
function initProfileScrollEffects() {
    var banner = document.querySelector(".profile-banner");
    if (banner) {
        var maxHeight = 260;
        var minHeight = 140;

        window.addEventListener("scroll", function () {
            var scrollY = window.scrollY || window.pageYOffset;
            var newHeight = maxHeight - scrollY * 0.5;
            if (newHeight < minHeight) newHeight = minHeight;
            if (newHeight > maxHeight) newHeight = maxHeight;
            banner.style.height = newHeight + "px";
        });
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
