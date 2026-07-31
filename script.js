/* ==========================================
   BELLA VISTA
   JavaScript
========================================== */

// ================= Loader =================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.display = "none";

    }, 1200);

});

// ================= Back To Top =================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

// ================= Sticky Header =================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.style.background = "#111";

    } else {

        header.style.background = "rgba(0,0,0,.55)";

    }

});

// ================= Dark Mode =================

const darkBtn = document.getElementById("darkModeBtn");

darkBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        darkBtn.innerHTML = "☀️";

    } else {

        darkBtn.innerHTML = "🌙";

    }

});

// ================= Mobile Menu =================

const menuBtn = document.querySelector(".menu-toggle");

const nav = document.querySelector("nav");

menuBtn.addEventListener("click", () => {

    if (nav.style.display === "flex") {

        nav.style.display = "none";

    } else {

        nav.style.display = "flex";
        nav.style.flexDirection = "column";
        nav.style.position = "absolute";
        nav.style.top = "90px";
        nav.style.right = "8%";
        nav.style.background = "#111";
        nav.style.padding = "20px";
        nav.style.borderRadius = "12px";
        nav.style.gap = "20px";

    }

});

// ================= Reservation =================

const form = document.querySelector(".reservation form");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    alert("✅ Your reservation has been sent successfully!");

});

// ================= Newsletter =================

const newsForm = document.querySelector(".newsletter form");

newsForm.addEventListener("submit", (e) => {

    e.preventDefault();

    alert("🎉 Thank you for subscribing!");

});

// ================= Counter Animation =================
// ===== Animated Counters =====

const counters = document.querySelectorAll(".counter");

const speed = 120;

counters.forEach(counter => {

    const target = +counter.dataset.target;

    let count = 0;

    const updateCounter = () => {

        const increment = target / speed;

        count += increment;

        if (count < target) {

            if (target >= 1000) {

                counter.innerText = Math.floor(count / 1000) + "K+";

            } else {

                counter.innerText = Math.floor(count) + "+";

            }

            requestAnimationFrame(updateCounter);

        } else {

            if (target >= 1000) {

                counter.innerText = (target / 1000) + "K+";

            } else {

                counter.innerText = target + "+";

            }

        }

    };

    updateCounter();

});

// ================= Active Navbar =================

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});