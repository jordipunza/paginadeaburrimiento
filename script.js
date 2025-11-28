// Música de fondo
let musica = new Audio("musicauno/musicafondo.mp3");
musica.loop = true;
musica.play();

function toggleCapitulos() {
  const submenu = document.getElementById("capitulos");
  submenu.classList.toggle("show");
}

function toggleMusica() {
  if (musica.paused) {
    musica.play();
  } else {
    musica.pause();
  }
}

function mostrarCreditos() {
  const creditos = document.getElementById("creditos");
  creditos.style.display = creditos.style.display === "block" ? "none" : "block";
}