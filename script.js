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

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby68sowQzuMzwNjKhFVvJHwa4OW6s0pUP9hNzxZSwr-fFGPVObYHZEANL2WCiovEMXe/exec";

// ================= Dynamic Menu (from Google Sheet) =================

const menuContainer = document.querySelector(".menu-container");

if (menuContainer) {
    fetch(GOOGLE_SHEET_URL + "?t=" + Date.now(), { cache: "no-store" })
        .then((res) => res.json())
        .then((items) => {
            menuContainer.innerHTML = "";

            items.forEach((item) => {
                const card = document.createElement("div");
                card.className = "food-card";

                const badge = item.Badge || item.badge || "";
                const name = item.Name || item.name || "";
                const description = item.Description || item.description || "";
                const price = item.Price || item.price || "";
                const image = item.Image || item.image || "";

                const badgeHTML = badge
                    ? `<span class="badge${badge.toLowerCase() === "new" ? " new" : ""}">${badge}</span>`
                    : "";

                card.innerHTML = `
                    ${badgeHTML}
                    <img src="images/${image}" alt="${name}" loading="lazy">
                    <div class="food-info">
                        <h3>${name}</h3>
                        <div class="rating">⭐⭐⭐⭐⭐</div>
                        <p>${description}</p>
                        <div class="price-row">
                            <span class="price">$${price}</span>
                            <button>Add To Cart</button>
                        </div>
                    </div>
                `;

                menuContainer.appendChild(card);
            });
        })
        .catch((err) => {
            console.error("Failed to load menu:", err);
            // لو فشل التحميل، المنيو الثابت هيفضل زي ما هو (احتياطي)
        });
}

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
    submitBtn.innerHTML = "Checking availability...";

    const templateParams = {
        name: form.querySelector('input[name="name"]').value,
        email: form.querySelector('input[name="email"]').value,
        phone: form.querySelector('input[name="phone"]').value,
        date: form.querySelector('input[name="date"]').value,
        time: form.querySelector('input[name="time"]').value,
    };

    // الخطوة 1: نتأكد إن الميعاد ده متاح قبل ما نبعت أي حاجة
    fetch(GOOGLE_SHEET_URL + "?action=checkAvailability&date=" + encodeURIComponent(templateParams.date) + "&time=" + encodeURIComponent(templateParams.time) + "&t=" + Date.now(), { cache: "no-store" })
        .then((res) => res.json())
        .then((result) => {
            if (result.available === false) {
                alert("⚠️ Sorry, this time slot is already booked. Please choose a different date or time.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }

            submitBtn.innerHTML = "Sending...";

            // الخطوة 2: الميعاد متاح، نسجل الحجز في Google Sheet (بالتوازي مع الإيميل)
            fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(templateParams),
            }).catch((err) => console.error("Sheet log failed:", err));

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
        })
        .catch((err) => {
            console.error("Availability check failed:", err);
            // لو فحص التوفر نفسه فشل (مشكلة نت مثلاً)، نكمل الحجز عادي بدل ما نوقف المستخدم
            submitBtn.innerHTML = "Sending...";

            fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(templateParams),
            }).catch((err2) => console.error("Sheet log failed:", err2));

            emailjs.send("service_eyj7j0m", "template_k4h7wfq", templateParams)
                .then(() => {
                    alert("✅ Your reservation has been sent successfully!");
                    form.reset();
                })
                .catch((err2) => {
                    alert("❌ Something went wrong, please try again.");
                    console.error(err2);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
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