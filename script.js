const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

let lastScrollY = window.pageYOffset;
let scrollDirection = 1;

window.addEventListener('scroll', () => {
    const currentY = window.pageYOffset;
    scrollDirection = currentY > lastScrollY ? 1 : -1;
    lastScrollY = currentY;
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const element = entry.target;
        const isLeavingUp = !entry.isIntersecting && scrollDirection < 0 && entry.boundingClientRect.top < 0;

        if (entry.isIntersecting) {
            element.classList.add('visible');
            element.classList.remove('animate-slide-out-left', 'animate-slide-out-right', 'animate-slide-out-down');

            if (element.classList.contains('fly-left')) {
                element.classList.add('animate-slide-in-left');
            } else if (element.classList.contains('fly-right')) {
                element.classList.add('animate-slide-in-right');
            } else if (element.classList.contains('fly-up') || element.classList.contains('pipeline-item')) {
                element.classList.add('animate-slide-in-up');
            } else {
                element.classList.add('animate-fade-in');
            }
        } else if (isLeavingUp) {
            element.classList.remove('animate-slide-in-left', 'animate-slide-in-right', 'animate-slide-in-up', 'animate-fade-in');
            element.classList.remove('visible');

            if (element.classList.contains('fly-left')) {
                element.classList.add('animate-slide-out-left');
            } else if (element.classList.contains('fly-right')) {
                element.classList.add('animate-slide-out-right');
            } else if (element.classList.contains('fly-up') || element.classList.contains('pipeline-item')) {
                element.classList.add('animate-slide-out-down');
            }
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.section-card, .fly-left, .fly-right, .fly-up, .pipeline-item');
animatedElements.forEach((el) => {
    observer.observe(el);
});

const pipelineItems = document.querySelectorAll('.pipeline-item');
pipelineItems.forEach((item) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.addEventListener('animationend', () => {
        item.style.opacity = '';
        item.style.transform = '';
    });
});

document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.classList.add('animate-glow');
    });
    btn.addEventListener('mouseleave', () => {
        btn.classList.remove('animate-glow');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const header = document.querySelector('.page-header');
const heroImage = document.querySelector('.header-image');
const hero = document.querySelector('.min-h-screen');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (header) {
        header.style.opacity = '1';
        header.style.backgroundColor = '#1f2228';
    }

    if (heroImage) {
        heroImage.style.transform = `translate(-50%, ${scrollY * 0.15}px)`;
    }

    if (hero) {
        hero.style.transform = 'none';
    }
});
