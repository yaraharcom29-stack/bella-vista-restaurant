/* ==========================================
   BELLA VISTA — Public Website JavaScript
========================================== */

"use strict";

// ================= Configuration =================

const GOOGLE_SHEET_URL =
    "https://script.google.com/macros/s/AKfycby68sowQzuMzwNjKhFVvJHwa4OW6s0pUP9hNzxZSwr-fFGPVObYHZEANL2WCiovEMXe/exec";

const EMAILJS_PUBLIC_KEY = "xIFhq-FyYG3moLNPj";
const EMAILJS_SERVICE_ID = "service_eyj7j0m";
const RESERVATION_TEMPLATE_ID = "template_k4h7wfq";
const NEWSLETTER_TEMPLATE_ID = "template_sfcv14c";
const REQUEST_TIMEOUT_MS = 20000;
const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="#ececec"/><text x="400" y="255" text-anchor="middle" font-family="Arial" font-size="32" fill="#777">Bella Vista</text></svg>'
    );

// ================= EmailJS =================

if (typeof window.emailjs !== "undefined") {
    window.emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
    });
} else {
    console.warn("EmailJS library was not loaded.");
}

// ================= General Helpers =================

function setFormMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = `form-message${type ? ` ${type}` : ""}`;
}

function normalizePhone(value) {
    return String(value || "").replace(/[\s().-]/g, "");
}

function validatePhone(value) {
    return /^\+?[0-9]{8,15}$/.test(normalizePhone(value));
}

function todayInCairo() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = {};

    parts.forEach((part) => {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    });

    return `${values.year}-${values.month}-${values.day}`;
}

function isThirtyMinuteSlot(time) {
    const match = /^(\d{2}):(\d{2})$/.exec(String(time || ""));
    if (!match) return false;

    const minutes = Number(match[2]);
    return minutes === 0 || minutes === 30;
}

function resolveImageSrc(image) {
    const value = String(image || "").trim();

    if (!value) return PLACEHOLDER_IMAGE;
    if (/^https:\/\//i.test(value)) return value;
    if (/^[a-zA-Z0-9._-]+$/.test(value)) {
        return `images/${encodeURIComponent(value)}`;
    }

    return PLACEHOLDER_IMAGE;
}

async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error("Non-JSON server response:", text);
            throw new Error("The server returned an invalid response. Please try again.");
        }

        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status})`);
        }

        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("The request took too long. Please try again.");
        }

        throw error;
    } finally {
        window.clearTimeout(timeout);
    }
}

// ================= Dynamic Menu =================

const menuContainer = document.querySelector(".menu-container");

function createMenuCard(item) {
    const card = document.createElement("article");
    card.className = "food-card";

    const badge = String(item.badge || item.Badge || "").trim();
    const name = String(item.name || item.Name || "Unnamed dish").trim();
    const description = String(item.description || item.Description || "").trim();
    const price = String(item.price ?? item.Price ?? "").trim();
    const image = item.image || item.Image || "";

    if (badge) {
        const badgeElement = document.createElement("span");
        badgeElement.className = `badge${badge.toLowerCase() === "new" ? " new" : ""}`;
        badgeElement.textContent = badge;
        card.appendChild(badgeElement);
    }

    const imageElement = document.createElement("img");
    imageElement.src = resolveImageSrc(image);
    imageElement.alt = name;
    imageElement.loading = "lazy";
    imageElement.addEventListener(
        "error",
        () => {
            imageElement.src = PLACEHOLDER_IMAGE;
        },
        { once: true }
    );
    card.appendChild(imageElement);

    const info = document.createElement("div");
    info.className = "food-info";

    const title = document.createElement("h3");
    title.textContent = name;
    info.appendChild(title);

    if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        info.appendChild(paragraph);
    }

    const priceRow = document.createElement("div");
    priceRow.className = "price-row";

    const priceElement = document.createElement("span");
    priceElement.className = "price";
    priceElement.textContent = price ? `$${price}` : "Price on request";
    priceRow.appendChild(priceElement);

    const bookingLink = document.createElement("a");
    bookingLink.className = "menu-book-link";
    bookingLink.href = "#reservation";
    bookingLink.textContent = "Book a Table";
    priceRow.appendChild(bookingLink);

    info.appendChild(priceRow);
    card.appendChild(info);

    return card;
}

async function loadPublicMenu() {
    if (!menuContainer) return;

    try {
        const items = await fetchJson(`${GOOGLE_SHEET_URL}?t=${Date.now()}`, {
            cache: "no-store",
        });

        if (!Array.isArray(items)) {
            throw new Error("Invalid menu response");
        }

        menuContainer.replaceChildren();

        if (items.length === 0) {
            const empty = document.createElement("p");
            empty.className = "menu-status";
            empty.textContent = "The menu will be available soon.";
            menuContainer.appendChild(empty);
            return;
        }

        items.forEach((item) => {
            menuContainer.appendChild(createMenuCard(item));
        });
    } catch (error) {
        console.error("Failed to load menu:", error);
        menuContainer.replaceChildren();

        const failure = document.createElement("p");
        failure.className = "menu-status error";
        failure.textContent = "The menu could not be loaded right now. Please try again later.";
        menuContainer.appendChild(failure);
    }
}

loadPublicMenu();

// ================= Loader =================

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    if (loader) {
        window.setTimeout(() => {
            loader.classList.add("loader-hidden");
        }, 350);
    }
});

// ================= Back To Top =================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
    if (topBtn) {
        topBtn.classList.toggle("visible", window.scrollY > 500);
    }
});

if (topBtn) {
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ================= Header & Navigation =================

const header = document.querySelector(".header");
const menuBtn = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
    if (header) {
        header.classList.toggle("scrolled", window.scrollY > 80);
    }

    let currentSectionId = "";

    sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 160) {
            currentSectionId = section.id;
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentSectionId}`
        );
    });
});

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });
}

// ================= Dark Mode =================

const darkBtn = document.getElementById("darkModeBtn");
const savedTheme = localStorage.getItem("bella-vista-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

function updateThemeButton() {
    if (!darkBtn) return;

    const isDark = document.body.classList.contains("dark");
    darkBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    darkBtn.setAttribute("aria-label", isDark ? "Use light mode" : "Use dark mode");
}

updateThemeButton();

if (darkBtn) {
    darkBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(
            "bella-vista-theme",
            document.body.classList.contains("dark") ? "dark" : "light"
        );
        updateThemeButton();
    });
}

// ================= Reservation Form =================

const reservationForm = document.getElementById("reservationForm");

if (reservationForm) {
    const dateInput = reservationForm.elements.date;
    const messageElement = document.getElementById("reservationMessage");

    if (dateInput) {
        dateInput.min = todayInCairo();
    }

    reservationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = reservationForm.querySelector('button[type="submit"]');
        if (!submitButton) return;

        setFormMessage(messageElement, "");

        if (!reservationForm.checkValidity()) {
            reservationForm.reportValidity();
            return;
        }

        const payload = {
            type: "reservation",
            name: reservationForm.elements.name.value.trim(),
            email: reservationForm.elements.email.value.trim(),
            phone: reservationForm.elements.phone.value.trim(),
            date: reservationForm.elements.date.value,
            time: reservationForm.elements.time.value,
            website: reservationForm.elements.website.value,
        };

        if (payload.name.length < 2 || payload.name.length > 80) {
            setFormMessage(messageElement, "Please enter a valid name.", "error");
            reservationForm.elements.name.focus();
            return;
        }

        if (!validatePhone(payload.phone)) {
            setFormMessage(
                messageElement,
                "Please enter a valid phone number using 8–15 digits.",
                "error"
            );
            reservationForm.elements.phone.focus();
            return;
        }

        if (payload.date < todayInCairo()) {
            setFormMessage(messageElement, "Please choose today or a future date.", "error");
            return;
        }

        if (
            payload.time < "12:00" ||
            payload.time > "23:00" ||
            !isThirtyMinuteSlot(payload.time)
        ) {
            setFormMessage(
                messageElement,
                "Choose a time between 12:00 PM and 11:00 PM ending in :00 or :30.",
                "error"
            );
            return;
        }

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Booking...";

        try {
            const result = await fetchJson(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            if (result.result !== "success") {
                throw new Error(result.message || "Reservation could not be saved.");
            }

            setFormMessage(
                messageElement,
                "Your reservation was saved successfully.",
                "success"
            );

            if (typeof window.emailjs !== "undefined") {
                window.emailjs
                    .send(EMAILJS_SERVICE_ID, RESERVATION_TEMPLATE_ID, payload)
                    .catch((error) => {
                        console.error("Confirmation email failed:", error);
                    });
            }

            reservationForm.reset();
            dateInput.min = todayInCairo();
        } catch (error) {
            console.error("Reservation failed:", error);
            setFormMessage(
                messageElement,
                error.message || "Something went wrong. Please try again.",
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ================= Contact Form =================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const messageElement = document.getElementById("contactMessage");

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (!submitButton) return;

        setFormMessage(messageElement, "");

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const payload = {
            type: "contact_message",
            name: contactForm.elements.name.value.trim(),
            email: contactForm.elements.email.value.trim(),
            message: contactForm.elements.message.value.trim(),
            website: contactForm.elements.website.value,
        };

        if (payload.name.length < 2 || payload.name.length > 80) {
            setFormMessage(messageElement, "Please enter a valid name.", "error");
            contactForm.elements.name.focus();
            return;
        }

        if (payload.message.length < 5 || payload.message.length > 2000) {
            setFormMessage(
                messageElement,
                "Please enter a message between 5 and 2000 characters.",
                "error"
            );
            contactForm.elements.message.focus();
            return;
        }

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            const result = await fetchJson(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            if (result.result !== "success") {
                throw new Error(result.message || "Message could not be sent.");
            }

            setFormMessage(
                messageElement,
                "Thanks! Your message has been received.",
                "success"
            );
            contactForm.reset();
        } catch (error) {
            console.error("Contact form failed:", error);
            setFormMessage(
                messageElement,
                error.message || "Could not send your message.",
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ================= Newsletter =================

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
    const messageElement = document.getElementById("newsletterMessage");

    newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        const emailInput = newsletterForm.elements.email;

        if (!submitButton || !emailInput) return;

        setFormMessage(messageElement, "");

        if (!newsletterForm.checkValidity()) {
            newsletterForm.reportValidity();
            return;
        }

        if (typeof window.emailjs === "undefined") {
            setFormMessage(
                messageElement,
                "Newsletter service is currently unavailable.",
                "error"
            );
            return;
        }

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            await window.emailjs.send(
                EMAILJS_SERVICE_ID,
                NEWSLETTER_TEMPLATE_ID,
                { email: emailInput.value.trim() }
            );

            setFormMessage(messageElement, "Thank you for subscribing!", "success");
            newsletterForm.reset();
        } catch (error) {
            console.error("Newsletter subscription failed:", error);
            setFormMessage(
                messageElement,
                "Something went wrong. Please try again.",
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}