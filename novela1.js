class Fondo {
  constructor(contenedorId) {
    this.contenedor = document.getElementById(contenedorId);

    this.layer1 = document.createElement("div");
    this.layer2 = document.createElement("div");
    this.layer1.className = "fondo-layer visible";
    this.layer2.className = "fondo-layer";

    this.contenedor.appendChild(this.layer1);
    this.contenedor.appendChild(this.layer2);

    this.activeLayer = this.layer1;
    this.inactiveLayer = this.layer2;

    this.currentImage = null; // 🔥 guardamos la imagen actual
  }

  cambiarFondo(imagen) {
    // ✅ Solo cambiamos si la imagen es distinta
    if (this.currentImage === imagen) return;

    this.inactiveLayer.style.backgroundImage = `url(${imagen})`;
    this.inactiveLayer.classList.add("visible");
    this.activeLayer.classList.remove("visible");

    const temp = this.activeLayer;
    this.activeLayer = this.inactiveLayer;
    this.inactiveLayer = temp;

    this.currentImage = imagen;
  }
}

class Musica {
  constructor() {
    this.audio = null;
    this.muted = false;
  }

  cambiarMusica(ruta) {
    if (this.audio) this.audio.pause();
    this.audio = new Audio(ruta);
    this.audio.loop = true;
    this.audio.muted = this.muted;
    this.audio.play().catch(() => {});
  }

  setMute(valor) {
    this.muted = valor;
    if (this.audio) {
      this.audio.muted = valor;
    }
  }
}

class Sonido {
  constructor() {
    this.efecto = null;
  }

  reproducir(ruta) {
    if (this.efecto) {
      this.efecto.pause();
      this.efecto.currentTime = 0;
    }
    this.efecto = new Audio(ruta);
    this.efecto.play().catch(() => {});
  }
}

class Bocadillo {
  constructor(contenedorId, posicion = "izquierda", getSkipMode = () => false) {
    this.contenedor = document.getElementById(contenedorId);
    this.posicion = posicion;
    this.getSkipMode = getSkipMode;
    this.finished = false;
  }

  mostrarDialogo(texto, imagen, nombre = "", fuente = "inherit", onFinishedWriting) {
    this.contenedor.innerHTML = `
      <div class="dialogo-contenedor ${this.posicion}">
        <img src="${imagen}" class="personaje" alt="">
        <div class="bocadillo">
          ${nombre ? `<div class="nombre">${nombre}</div>` : ""}
          <div class="bocadillo-texto" style="font-family:${fuente};"></div>
        </div>
      </div>
    `;
    this.contenedor.style.display = "block";

    const textoElem = this.contenedor.querySelector(".bocadillo-texto");
    const imgElem = this.contenedor.querySelector(".personaje");

    requestAnimationFrame(() => {
      imgElem.classList.add("visible");
    });

    let index = 0;
    const baseSpeed = 50;
    const fastSpeed = 20;

    const escribir = () => {
      if (index < texto.length) {
        textoElem.textContent += texto.charAt(index);
        index++;
        const delay = this.getSkipMode() ? fastSpeed : baseSpeed;
        setTimeout(escribir, delay);
      } else {
        this.finished = true;
        if (onFinishedWriting) onFinishedWriting();
      }
    };

    escribir();
  }

  ocultar() {
    this.contenedor.style.display = "none";
  }
}

class Escena {
  constructor(fondo, musica, sonido) {
    this.fondo = fondo;
    this.musica = musica;
    this.sonido = sonido;
    this.dialogos = [];
    this.indice = 0;
    this.skipMode = false;
    this.currentBocadillo = null;
  }

  agregarDialogo(texto, imagen, posicion = "izquierda", fondo = null, musica = null, sonido = null, nombre = "", fuente = "inherit") {
    this.dialogos.push({ texto, imagen, posicion, fondo, musica, sonido, nombre, fuente });
  }

  iniciar() {
    this.indice = 0;
    this.mostrarDialogoActual();
  }

  avanzar() {
    if (this.indice < this.dialogos.length - 1) {
      this.indice++;
      this.mostrarDialogoActual();
    }
    this.actualizarPrevBtn();
  }

  retroceder() {
    if (this.indice > 0) {
      this.indice--;
      this.mostrarDialogoActual();
    }
    this.actualizarPrevBtn();
  }

  mostrarDialogoActual() {
    const d = this.dialogos[this.indice];

    // 🔥 Buscar el último fondo válido hasta este índice
    let fondoActual = null;
    for (let i = this.indice; i >= 0; i--) {
      if (this.dialogos[i].fondo) {
        fondoActual = this.dialogos[i].fondo;
        break;
      }
    }
    if (fondoActual) {
      this.fondo.cambiarFondo(fondoActual);
    }

    if (d.musica) this.musica.cambiarMusica(d.musica);
    if (d.sonido) this.sonido.reproducir(d.sonido);

    this.currentBocadillo = new Bocadillo("dialogo", d.posicion, () => this.skipMode);
    this.currentBocadillo.mostrarDialogo(d.texto, d.imagen, d.nombre, d.fuente, () => {
      if (this.skipMode) {
        setTimeout(() => {
          this.avanzar();
        }, 1200);
      }
    });
  }

  actualizarPrevBtn() {
    const prevBtn = document.getElementById("prevBtn");
    if (!prevBtn) return;
    prevBtn.disabled = this.skipMode || this.indice === 0;
  }
}

window.addEventListener("load", () => {
  const fondo = new Fondo("fondo");
  const musica = new Musica();
  const sonido = new Sonido();
  const escena = new Escena(fondo, musica, sonido);

  const skipBtn = document.getElementById("skipBtn");
  skipBtn.addEventListener("click", () => {
    escena.skipMode = !escena.skipMode;
    skipBtn.classList.toggle("active", escena.skipMode);
    skipBtn.textContent = escena.skipMode ? "Skip ON" : "Skip OFF";
    const b = escena.currentBocadillo;
    if (escena.skipMode && b && b.finished) {
      escena.avanzar();
    }
    escena.actualizarPrevBtn();
  });

  const prevBtn = document.getElementById("prevBtn");
  prevBtn.addEventListener("click", () => {
    if (!escena.skipMode) {
      escena.retroceder();
    }
  });

  const menuBtn = document.getElementById("menuBtn");
  menuBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    if (escena.musica.muted) {
      escena.musica.setMute(false);
      muteBtn.textContent = "🔊 Música";
    } else {
      escena.musica.setMute(true);
      muteBtn.textContent = "🔇 Música";
    }
  });

  const startScreen = document.getElementById("startScreen");
  startScreen.addEventListener("click", () => {
    startScreen.style.display = "none";
    escena.iniciar();
    escena.actualizarPrevBtn();
  }, { once: true });

  document.addEventListener("click", (ev) => {
    if (ev.target && (ev.target.id === "skipBtn" || ev.target.id === "prevBtn" || ev.target.id === "menuBtn" || ev.target.id === "muteBtn")) return;
    if (ev.target && ev.target.id === "startScreen") return;
    const b = escena.currentBocadillo;
    if (b && b.finished && !escena.skipMode) {
      escena.avanzar();
    }
  });

  // 📌 Primer diálogo con comentarios de cada parámetro
  escena.agregarDialogo(
    "Hola, soy el protagonista.",   // texto que se muestra en el bocadillo
    "img/ninjach.png",              // sprite del personaje (imagen del protagonista)
    "izquierda",                    // posición del bocadillo (izquierda/derecha)
    "img/ninjafondo.jpg",           // fondo de la escena
    "img/musicauno/fondo.mp3",      // música de fondo
    null,                           // sonido puntual (efecto de sonido)
    "Ninjamejor",                   // nombre del personaje que habla
    "Georgia"                       // fuente tipográfica del texto
  );

  escena.agregarDialogo(
    "Ninja feo",
    "img/momo.png",
    "derecha",
    null,
    null,
    null,
    "Momo",
    "Courier New"
  );

  escena.agregarDialogo(
    ":(",
    "img/ninjach.png",
    "izquierda",
    "img/momo.png",
    "img/musicauno/accion.mp3",
    "img/sonidos/meretiro.mp3",
    "Ninjamejor",
    "Comic Sans MS"
  );
});
