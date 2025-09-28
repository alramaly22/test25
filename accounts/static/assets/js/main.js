/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu')
        // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))
    /*=============== CHANGE BACKGROUND HEADER ===============*/
const shadowHeader = () => {
    const header = document.getElementById('header')
        // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
    this.scrollY >= 50 ? header.classList.add('shadow-header') :
        header.classList.remove('shadow-header')
}
window.addEventListener('scroll', shadowHeader)


/*=============== ADD SHADOW HEADER ===============*/


/*=============== SWIPER POPULAR ===============*/
const swiperPopular = new Swiper('.popular__swiper', {
    loop: true,
    grabCursor: true,
    slidesPerView: 'auto',
    centeredSlides: 'auto',
});

/*=============== SHOW SCROLL UP ===============*/
function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    // When the scroll is higher than 200 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if (this.scrollY >= 350) scrollUp.classList.add('show-scroll');
    else scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 300,
    reset: true
})
sr.reveal(`.home__data , .popular__container , .footer`)
sr.reveal(`.home__board`, { delay: 700, distance: '100px', origin: 'right' })
sr.reveal(`.home__pizza`, { delay: 1400, distance: '100px', origin: 'bottom', rotate: { z: -90 } })
sr.reveal(`.home__ingredient`, { delay: 2000, interval: 100 })
sr.reveal(`.about__data , .recipe__list ,.contact__data`, { origin: 'right' })
sr.reveal(`.about__img ,.recipe__img ,.contact__image`, { origin: 'left' })
sr.reveal(`.products__card`, { interval: 100 })