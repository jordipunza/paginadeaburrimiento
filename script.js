let musica = new Audio("img/musicauno/fondo.mp3");
musica.loop = true;

window.addEventListener("load", () => {
  // El intro permanece visible hasta que el usuario haga clic
  const intro = document.getElementById("intro");

  document.addEventListener("click", () => {
    // Ocultamos el intro
    if (intro) intro.style.display = "none";

    // Reproducimos la música
    musica.play().catch(() => {
      console.log("Autoplay bloqueado, pero ya se intentó iniciar.");
    });
  }, { once: true }); // solo la primera vez
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
