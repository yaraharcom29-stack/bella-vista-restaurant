/* ==========================================
   BELLA VISTA
   JavaScript
========================================== */

// ================= EmailJS Init =================
// عدّلي الـ PUBLIC KEY هنا بس (تلاقيه في حسابك على emailjs.com > Account)

(function () {
    emailjs.init({
        publicKey: "xIFhq-FyYG3moLNPj",
    });
})();

// ================= Loader =================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.display = "none";

    }, 400);

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
// عدّلي SERVICE_ID و TEMPLATE_ID بتوعك من emailjs.com

const form = document.getElementById("reservationForm");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    const templateParams = {
        name: form.querySelector('input[name="name"]').value,
        email: form.querySelector('input[name="email"]').value,
        phone: form.querySelector('input[name="phone"]').value,
        date: form.querySelector('input[name="date"]').value,
        time: form.querySelector('input[name="time"]').value,
    };

    emailjs.send("service_eyj7j0m", "template_k4h7wfq", templateParams)
        .then(() => {
            alert("✅ Your reservation has been sent successfully!");
            form.reset();
        })
        .catch((err) => {
            alert("❌ Something went wrong, please try again.");
            console.error(err);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });

});

// ================= Newsletter =================
// عدّلي SERVICE_ID و TEMPLATE_ID بتوعك من emailjs.com

const newsForm = document.getElementById("newsletterForm");

newsForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const submitBtn = newsForm.querySelector("button");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    const templateParams = {
        email: newsForm.querySelector('input[name="email"]').value,
    };

    emailjs.send("service_eyj7j0m", "template_sfcv14c", templateParams)
        .then(() => {
            alert("🎉 Thank you for subscribing!");
            newsForm.reset();
        })
        .catch((err) => {
            alert("❌ Something went wrong, please try again.");
            console.error(err);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });

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