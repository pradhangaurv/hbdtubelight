
/* ===================================
   BACKGROUND PHOTO SLIDESHOW
=================================== */

const backgroundImages = document.querySelectorAll(".background-image");

let backgroundIndex = 0;

if (backgroundImages.length > 1) {
    setInterval(() => {
        backgroundImages[backgroundIndex].classList.remove("active");

        backgroundIndex = (backgroundIndex + 1) % backgroundImages.length;

        backgroundImages[backgroundIndex].classList.add("active");
    }, 5000);
}


/* ===================================
   SCROLL REVEAL ANIMATIONS
=================================== */

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }

    });

}, {
    threshold: 0.12
});

revealElements.forEach(element => {
    observer.observe(element);
});


/* ===================================
   BACKGROUND MUSIC
   ATTEMPT TO START WHEN SCROLLING
=================================== */

const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicLabel = document.getElementById("musicLabel");

let musicStarted = false;
let musicAttemptInProgress = false;

function updateMusicButton() {

    if (!backgroundMusic || !musicLabel) return;

    if (backgroundMusic.paused) {
        musicToggle?.classList.remove("playing");
        musicLabel.textContent = "Play our soundtrack";
    } else {
        musicToggle?.classList.add("playing");
        musicLabel.textContent = "Pause our soundtrack";
    }

}

async function startBackgroundMusic() {

    if (!backgroundMusic || musicStarted || musicAttemptInProgress) {
        return;
    }

    musicAttemptInProgress = true;

    try {

        await backgroundMusic.play();

        musicStarted = true;

        window.removeEventListener("scroll", startBackgroundMusic);

    } catch (error) {

        console.log("Browser blocked automatic music. Use the music button.");

    } finally {

        musicAttemptInProgress = false;

        updateMusicButton();

    }

}

window.addEventListener("scroll", startBackgroundMusic, {
    passive: true
});

if (musicToggle && backgroundMusic) {

    musicToggle.addEventListener("click", async () => {

        if (backgroundMusic.paused) {

            try {

                await backgroundMusic.play();

                musicStarted = true;

                window.removeEventListener("scroll", startBackgroundMusic);

            } catch (error) {

                console.log("Unable to play music.");

            }

        } else {

            backgroundMusic.pause();

        }

        updateMusicButton();

    });

    backgroundMusic.addEventListener("play", updateMusicButton);
    backgroundMusic.addEventListener("pause", updateMusicButton);

}


/* ===================================
   PHOTO GALLERY
   AUTO SLIDE + ARROWS + DOTS + DRAG
=================================== */

const galleryTrack = document.getElementById("galleryTrack");
const galleryViewport = document.getElementById("galleryViewport");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");
const galleryDots = document.getElementById("galleryDots");

if (galleryTrack && galleryViewport && galleryDots) {

    const slides = Array.from(
        galleryTrack.querySelectorAll(".gallery-slide")
    );

    const totalSlides = slides.length;

    let currentSlide = 0;
    let galleryTimer = null;

    let isDragging = false;
    let startX = 0;
    let pointerMoved = false;

    /* CREATE DOTS AUTOMATICALLY */

    slides.forEach((slide, index) => {

        const dot = document.createElement("button");

        dot.className = "gallery-dot";

        dot.setAttribute(
            "aria-label",
            `Go to photograph ${index + 1}`
        );

        dot.addEventListener("click", () => {

            showSlide(index);
            restartGallery();

        });

        galleryDots.appendChild(dot);

    });

    const dots = galleryDots.querySelectorAll(".gallery-dot");


    /* DISPLAY SELECTED SLIDE */

    function showSlide(index) {

        if (totalSlides === 0) return;

        currentSlide = (index + totalSlides) % totalSlides;

        galleryTrack.style.transform =
            `translateX(-${currentSlide * 100}%)`;

        dots.forEach((dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === currentSlide
            );

        });

    }


    /* NEXT AND PREVIOUS BUTTONS */

    if (galleryNext) {

        galleryNext.addEventListener("click", () => {

            showSlide(currentSlide + 1);
            restartGallery();

        });

    }

    if (galleryPrev) {

        galleryPrev.addEventListener("click", () => {

            showSlide(currentSlide - 1);
            restartGallery();

        });

    }


    /* AUTOMATIC SLIDESHOW */

    function startGallery() {

        stopGallery();

        if (totalSlides <= 1 || document.hidden) return;

        galleryTimer = setInterval(() => {

            showSlide(currentSlide + 1);

        }, 4000);

    }

    function stopGallery() {

        clearInterval(galleryTimer);
        galleryTimer = null;

    }

    function restartGallery() {

        startGallery();

    }


    /* PAUSE WHEN HOVERING */

    galleryViewport.addEventListener("mouseenter", stopGallery);

    galleryViewport.addEventListener("mouseleave", startGallery);


    /* MOBILE SWIPE AND DESKTOP DRAG */

    galleryViewport.addEventListener("pointerdown", event => {

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        startX = event.clientX;

        isDragging = true;
        pointerMoved = false;

        galleryViewport.classList.add("dragging");

        galleryViewport.setPointerCapture(event.pointerId);

        stopGallery();

    });


    galleryViewport.addEventListener("pointermove", event => {

        if (!isDragging) return;

        if (Math.abs(event.clientX - startX) > 8) {
            pointerMoved = true;
        }

    });


    galleryViewport.addEventListener("pointerup", event => {

        if (!isDragging) return;

        const difference = event.clientX - startX;

        if (difference < -45) {

            showSlide(currentSlide + 1);

        } else if (difference > 45) {

            showSlide(currentSlide - 1);

        }

        isDragging = false;

        galleryViewport.classList.remove("dragging");

        startGallery();

    });


    galleryViewport.addEventListener("pointercancel", () => {

        isDragging = false;

        galleryViewport.classList.remove("dragging");

        startGallery();

    });


    galleryViewport.addEventListener("lostpointercapture", () => {

        if (isDragging) {

            isDragging = false;

            galleryViewport.classList.remove("dragging");

            startGallery();

        }

    });


    /* PAUSE WHEN THE TAB IS NOT VISIBLE */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stopGallery();
        } else {
            startGallery();
        }

    });


    /* START GALLERY */

    showSlide(0);

    startGallery();

}


/* ===================================
   HIDDEN BIRTHDAY SURPRISE
=================================== */

const surpriseButton = document.getElementById("surpriseButton");
const surpriseMessage = document.getElementById("surpriseMessage");

if (surpriseButton && surpriseMessage) {

    surpriseButton.addEventListener("click", () => {

        surpriseMessage.classList.toggle("show");

        if (surpriseMessage.classList.contains("show")) {

            surpriseButton.textContent = "A little more happiness ♡";

        } else {

            surpriseButton.textContent = "Click to reveal ♡";

        }

    });

}
