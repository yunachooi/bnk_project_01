document.addEventListener("DOMContentLoaded", function () {
  const sliderTrack = document.getElementById("sliderTrack");
  const slides = document.querySelectorAll(".slide");
  const slideWidth = slides[0].offsetWidth;
  let index = 1;

  sliderTrack.style.transform = `translateX(-${slideWidth * index}px)`;

  setInterval(() => {
    index++;
    sliderTrack.style.transition = "transform 0.5s ease";
    sliderTrack.style.transform = `translateX(-${slideWidth * index}px)`;

    sliderTrack.addEventListener("transitionend", () => {
      if (index === slides.length - 1) {
        sliderTrack.style.transition = "none";
        index = 1;
        sliderTrack.style.transform = `translateX(-${slideWidth}px)`;
      }
    });
  }, 4000);
});