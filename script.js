const musica = document.getElementById("musica");

window.addEventListener("load", () => {
  // tras 6s (intro completo + fade), ocultamos el div intro
  setTimeout(() => {
    const intro = document.getElementById("intro");
    if (intro) intro.style.display = "none";
  }, 6000);
});

function toggleMusica() {
  if (musica.paused) {
    musica.play();
  } else {
    musica.pause();
  }
}

function toggleCapitulos() {
  const submenu = document.getElementById("capitulos");
  submenu.classList.toggle("show");
}

function mostrarCreditos() {
  const creditos = document.getElementById("creditos");
  creditos.style.display = creditos.style.display === "block" ? "none" : "block";
}
