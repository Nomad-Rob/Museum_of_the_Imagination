// Select hamburger menu
const menuBtn = document.querySelector(".navigation__button");

// Select navigation menu
const menu = document.querySelector(".navigation__menu");

// Select navigation menu list
const list = document.querySelector(".navigation__list");

// Select navigation list links
const menuLinks = document.querySelectorAll(".navigation__link");

const showMenu = () => {
  menuBtn.classList.toggle("navigation__button--active");
  const expanded = menuBtn.getAttribute("expanded");
  menuBtn.setAttribute("aria-expanded", !expanded);
  list.hidden = !list.hidden;
  menu.classList.toggle("navigation__menu--active");
};

menuBtn.addEventListener("click", showMenu);

menuLinks.forEach(v => {
  v.addEventListener("click", showMenu);
});

// IMAGE SLIDER
let imageIndex = 1;

function plusSlides(n) {
  imageSlider((imageIndex += n));
}

const cards = document.querySelectorAll(".happyclients__card");
const leftarrow = document.querySelector(".happyclients__arrows--left");
const rightarrow = document.querySelector(".happyclients__arrows--right");
const dots = document.querySelectorAll(".happyclients__dot");

leftarrow.addEventListener("click", () => {
  plusSlides(-1);
});

rightarrow.addEventListener("click", () => {
  plusSlides(1);
});

function imageSlider(n) {
  if (n > cards.length) {
    imageIndex = 1;
  }

  if (n < 1) {
    imageIndex = cards.length;
  }

  cards.forEach(v => {
    v.style.display = "none";
  });

  dots.forEach(v => {
    v.classList.remove("happyclients__dot--active");
  });

  cards[imageIndex - 1].style.display = "flex";

  dots[imageIndex - 1].classList.add("happyclients__dot--active");
}

dots.forEach((v, i) => {
  v.addEventListener("click", () => {
    imageIndex = i + 1;
    imageSlider(imageIndex);
  });
});

imageSlider(imageIndex);
