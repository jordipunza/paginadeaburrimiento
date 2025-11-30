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

    this.currentImage = null;
  }

  cambiarFondo(imagen) {
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
    this.currentRuta = null; // 🔥 nueva propiedad para recordar la música actual
  }

  cambiarMusica(ruta) {
    if (ruta === "muted") {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      this.currentRuta = "muted";
      return;
    }

    if (this.audio) this.audio.pause();

    this.audio = new Audio(ruta);
    this.audio.loop = true;
    this.audio.muted = this.muted;
    this.audio.play().catch(() => { });
    this.currentRuta = ruta; // 🔥 guardamos la ruta actual
  }

  setMute(valor) {
    this.muted = valor;
    if (this.audio) {
      this.audio.muted = valor;
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
      this.currentRuta = null;
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
    this.efecto.play().catch(() => { });
  }
}

class Bocadillo {
  constructor(contenedorId, posicion = "izquierda", getSkipMode = () => false, getLentoMode = () => false) {
    this.contenedor = document.getElementById(contenedorId);
    this.posicion = posicion;
    this.getSkipMode = getSkipMode;
    this.getLentoMode = getLentoMode;
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
    const baseSpeed = 70;   // velocidad normal
    const fastSpeed = 10;   // velocidad rápida (skip)
    const slowSpeed = 150;  // 🔥 nueva velocidad lenta

    const escribir = () => {
      if (index < texto.length) {
        textoElem.textContent += texto.charAt(index);
        index++;
        let delay;
        if (this.getLentoMode()) {
          delay = slowSpeed;
        } else {
          delay = this.getSkipMode() ? fastSpeed : baseSpeed;
        }
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

  // añadimos el parámetro showBubble al inicio
  agregarDialogo(showBubble = true, texto, imagen, posicion = "izquierda", fondo = null, musica = null, sonido = null, nombre = "", fuente = "inherit", noSkip = false, lento = false) {
    this.dialogos.push({
      tipo: "dialogo",
      showBubble,
      texto,
      imagen,
      posicion,
      fondo,
      musica,
      sonido,
      nombre,
      fuente,
      noSkip,
      lento
    });
  }

  agregarRedireccion(redirect) {
    this.dialogos.push({ tipo: "redirect", redirect });
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

  if (d.tipo === "redirect") {
    window.location.href = d.redirect;
    return;
  }

  // fondo válido
  let fondoActual = null;
  for (let i = this.indice; i >= 0; i--) {
    if (this.dialogos[i].fondo) {
      fondoActual = this.dialogos[i].fondo;
      break;
    }
  }
  if (fondoActual) this.fondo.cambiarFondo(fondoActual);

  // música válida (igual que el fondo, pero sin reiniciar si es null)
  let musicaActual = null;
  for (let i = this.indice; i >= 0; i--) {
    if (this.dialogos[i].musica !== null && this.dialogos[i].musica !== undefined) {
      musicaActual = this.dialogos[i].musica;
      break;
    }
  }
  if (musicaActual !== null && musicaActual !== undefined) {
    if (this.musica.currentRuta !== musicaActual) {
      this.musica.cambiarMusica(musicaActual);
    }
  }

  if (d.sonido) this.sonido.reproducir(d.sonido);

  // siempre crear Bocadillo, pero ocultar si showBubble = false
  this.currentBocadillo = new Bocadillo("dialogo", d.posicion, () => {
    if (this.skipMode && d.noSkip) return false;
    return this.skipMode;
  }, () => d.lento);

  this.currentBocadillo.mostrarDialogo(d.texto, d.imagen, d.nombre, d.fuente, () => {
    if (this.skipMode) {
      setTimeout(() => {
        this.avanzar();
      }, 0);
    }
  });

  // si no debe mostrarse el bocadillo, ocultamos el contenedor visual
  if (!d.showBubble) {
    const contenedor = document.getElementById("dialogo");
    const bocadilloElem = contenedor.querySelector(".bocadillo");
    if (bocadilloElem) bocadilloElem.style.display = "none";
    const nombreElem = contenedor.querySelector(".nombre");
    if (nombreElem) nombreElem.style.display = "none";
  }
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
    window.location.href = "../../index.html";
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
    if (["skipBtn", "prevBtn", "menuBtn", "muteBtn"].includes(ev.target.id)) return;
    if (ev.target && ev.target.id === "startScreen") return;
    const b = escena.currentBocadillo;
    if (b && b.finished && !escena.skipMode) {
      escena.avanzar();
    }
  });

  //  Ejemplo de diálogos y redirección
  // escena.agregarDialogo(
  //   true, // muestra bocadillo
  //   ". . .  ", //Contenido del texto, null es para nada
  //   "", //Imagen del personaje, null es apra nada
  //   "izquierda", //La imagen y el nombre del personaje, si o si pon uno
  //   "../../img/vacio.jpg", //Imagen del fondo "null" si quiero la misma"
  //   "../../img/musicauno/vacio.mp3", //Musica de este dialogo, "muted si no quiero ninguna" o null si quiero la misma
  //   null, //Audio q quiera ponerle
  //   "???", //Nombre del personaje
  //   "Fira Code", //tipografia
  //   true, //false se puede saltar, true no se puede (recomendacion añade espacios a final de un texto si es mi corto porque si tienes activado el skipear lo va a ignorar al ser tan pequeño el texto)
  //   true //true si quieres que el texto vaya muy lento, false si quieres que no vaya lento (si este esta activado, la opcion anterior estara anulada, me refiero la de saltar), aun asi si esta esta activa activa la otra
  // );
  escena.agregarDialogo(
    false,
    "aaaaaaaaaaaaaaaaa",
    null,
    "izquierda",
    "../../img/vacio.jpg",
    "../../img/musicauno/vacio.mp3",
    null,
    null,
    null,
    true,
    true
  );
  escena.agregarDialogo(
    true,
    ". . .",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    false
  );

  escena.agregarDialogo(
    false,
    "aaaaaaaaaaaaaaaaa",
    null,
    "izquierda",
    null,
    null,
    null,
    null,
    null,
    true,
    true
  );

  escena.agregarDialogo(
    true,
    "Porque sigues aqui...",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    true
  );
  escena.agregarDialogo(
    true,
    "No hay nada interesante y da igual cuanto intentes skipear no te voy a dejar skipear rapido ya que no hay nada",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    false
  );
  escena.agregarDialogo(
    true,
    "...      ",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    true
  );
  escena.agregarDialogo(
    true,
    "...      ",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    true
  );
  escena.agregarDialogo(
    true,
    "...      ",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    null,
    null,
    "Momo",
    "Courier New",
    true,
    true
  );
  escena.agregarDialogo(
    true,
    ". . .      ",
    "../../img/ch/momo/momo.png",
    "izquierda",
    null,
    "muted",
    null,
    "Momo",
    "Courier New",
    false,
    true
  );
  escena.agregarDialogo(
    true,
    "Vale dude",
    "../../img/ch/bear5/bear5.png",
    "derecha",
    "../../img/ninjafondo.jpg",
    "muted",
    "../../img/sonidos/bear5v2.mp3",
    "Bear5",
    "Courier New",
    true,
    true
  );
  escena.agregarRedireccion("../../index.html");
});
