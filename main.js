/* ==========================================================================
   TaskBoard — main.js
   Feature 1: Mobile nav toggle
   Feature 2: Data-driven creator cards (renders from CREATORS, filterable
              by search + category) — swap CREATORS for a fetch() to PHP later
   Feature 3: Commission request form validation
   Feature 4 (bonus): Scroll-reactive profile banner + portfolio reveal
   ========================================================================== */

var lenis = null;

document.addEventListener("DOMContentLoaded", function () {
    initLenis();
    initNavToggle();
    initTaskPins();
    initCreatorGrids();
    initRequestForm();
    initProfileScrollEffects();
    initRoleToggle();
    initSignupForm();
    initLoginForm();
    initAuthNav();
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

function featuredCardMarkup(creator) {
    // Every featured creator links to the profile page template for now —
    // once profiles are dynamic, this becomes profile.php?id=<creator.id>.
    return (
        '<a class="featured-card" href="template.html">' +
            '<div class="featured-card__info">' +
                '<p class="featured-card__category">' + creator.categoryLabel + '</p>' +
                '<h3 class="featured-card__name">' + creator.name + '</h3>' +
                '<p class="featured-card__price">From $' + creator.price + '</p>' +
            '</div>' +
        '</a>'
    );
}

function taskPinMarkup(task, index) {
    // pin-1/2/3 control each card's position + tilt in the cluster (see CSS)
    var positionClass = "pin-" + ((index % 3) + 1);
    return (
        '<article class="pin-card ' + positionClass + '">' +
            '<p class="tag">' + task.categoryLabel + '</p>' +
            '<h4>' + task.title + '</h4>' +
            '<p>Budget $' + task.budget + ' &middot; ' + task.meta + '</p>' +
        '</article>'
    );
}

function initTaskPins() {
    var container = document.querySelector('[data-task-pins]');
    if (!container || typeof TASKS === "undefined") return;
    container.innerHTML = TASKS.slice(0, 3).map(taskPinMarkup).join("");
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
        var maxHeight = 260;
        var minHeight = 140;

        function updateBanner(scrollY) {
            var newHeight = maxHeight - scrollY * 0.5;
            if (newHeight < minHeight) newHeight = minHeight;
            if (newHeight > maxHeight) newHeight = maxHeight;
            banner.style.height = newHeight + "px";
        }

        if (lenis) {
            // Lenis is intercepting scroll, so read position from its own
            // event instead of the native one, which won't match while
            // Lenis is still animating toward the target position.
            lenis.on("scroll", function (e) {
                updateBanner(e.scroll);
            });
        } else {
            window.addEventListener("scroll", function () {
                updateBanner(window.scrollY || window.pageYOffset);
            });
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
