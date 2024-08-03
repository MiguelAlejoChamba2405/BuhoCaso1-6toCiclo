document.addEventListener("DOMContentLoaded", function () {
  // Carga los archivos ya subidos al iniciar la página
  loadUploadedFiles();

  document
    .querySelector(".file-input")
    .addEventListener("change", handleFileSelection);

  document
    .querySelector(".file-upload")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const fileInput = document.querySelector(".file-input");
      handleFileSelection({ target: fileInput });
    });

  // Función para manejar la selección de archivos
  async function handleFileSelection(event) {
    let allowed_size_mb = 10240; // 10GB en MB
    let files_input = event.target.files;

    if (files_input.length === 0) {
      alert("Error: No se ha seleccionado ningún archivo");
      return;
    }

    for (let file of files_input) {
      let fileName = file.name.replace(/ /g, "_"); // Reemplaza espacios en blanco por guiones bajos
      if (file.size > allowed_size_mb * 1024 * 1024) {
        alert("Error: Tamaño excedido => " + fileName);
        continue;
      }

      try {
        let exists = await checkFileExists(fileName);
        if (exists) {
          alert("Archivos ya existentes: " + fileName);
        } else {
          await uploadFile(file, fileName);
        }
      } catch (error) {
        alert("Error al verificar el archivo: " + fileName);
      }
    }
  }

  // Función para verificar si el archivo ya existe
  function checkFileExists(filename) {
    let data = new FormData();
    data.append("checkfile", filename);

    return fetch("check_file.php", {
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .then((response) => response.exists);
  }

  // Función para subir el archivo
  async function uploadFile(file, fileName) {
    let uniq = "id-" + btoa(fileName).replace(/=/g, "").substring(0, 7);
    let filetype = file.type.match(/([^\/]+)\//);

    let li = `
            <li class="file-list ${
              filetype[1]
            }" id="${uniq}" data-filename="${fileName}">
                <div class="thumbnail">
                    <ion-icon name="document-outline"></ion-icon>
                    <ion-icon name="image-outline"></ion-icon>
                    <ion-icon name="musical-notes-outline"></ion-icon>
                    <ion-icon name="videocam-outline"></ion-icon>
                    <span class="completed" style="display: none;">
                        <ion-icon name="checkmark"></ion-icon>
                    </span>
                </div>
                <div class="properties">
                    <span class="title"><strong>${fileName}</strong></span>
                    <span class="size">${bytesToSize(file.size)}</span>
                    <a href="#" class="link" data-url="./descargas/${fileName}">Abrir</a>
                    <span class="progress">
                        <span class="buffer"></span>
                        <span class="percentage"></span>
                    </span>
                </div>
                <button class="remove" style="display: none;">
                    <ion-icon name="close"></ion-icon>
                </button>
            </li>
        `;

    // Inserta el nuevo elemento en la lista
    document
      .querySelector(".list-upload ul")
      .insertAdjacentHTML("afterbegin", li);
    let li_el = document.querySelector("#" + uniq);

    // Agrega el listener al enlace "Abrir"
    li_el.querySelector(".link").addEventListener("click", function (event) {
      event.preventDefault();
      let url = event.target.getAttribute("data-url");
      handleOpenFile(url);
    });

    // Crear un XMLHttpRequest para manejar la carga del archivo
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "upload.php", true);

    // Crear un FormData para enviar el archivo
    let data = new FormData();
    data.append("file", new File([file], fileName, { type: file.type }));

    // Actualizar la barra de progreso
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        let percent = (event.loaded / event.total) * 100;
        li_el.querySelector(".buffer").style.width = percent + "%";
        li_el.querySelector(".percentage").textContent = Math.round(percent) + "%";
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        li_el.querySelector(".completed").style.display = "flex";
        li_el.querySelector(".remove").style.display = "flex";
        li_el.querySelector(".remove").addEventListener("click", function () {
          removeFile(fileName, li_el);
        });
        li_el.querySelector(".progress").style.display = "none";
      } else {
        alert("Error al subir el archivo: " + fileName);
      }
    };

    xhr.onerror = function () {
      alert("Error al subir el archivo: " + fileName);
    };

    xhr.send(data);
  }

  // Función para cargar archivos subidos previamente
  function loadUploadedFiles() {
    fetch("uploaded_files.php")
      .then((response) => response.json())
      .then((files) => {
        files.forEach((file) => {
          let fileName = file.name.replace(/ /g, "_"); // Reemplaza espacios con guiones bajos
          let uniq = "id-" + btoa(fileName).replace(/=/g, "").substring(0, 7);
          let filetype = file.type.match(/([^\/]+)\//);

          let li = `
                        <li class="file-list ${
                          filetype[1]
                        }" id="${uniq}" data-filename="${fileName}">
                            <div class="thumbnail">
                                <ion-icon name="document-outline"></ion-icon>
                                <ion-icon name="image-outline"></ion-icon>
                                <ion-icon name="musical-notes-outline"></ion-icon>
                                <ion-icon name="videocam-outline"></ion-icon>
                                <span class="completed">
                                    <ion-icon name="checkmark"></ion-icon>
                                </span>
                            </div>
                            <div class="properties">
                                <span class="title"><strong>${fileName}</strong></span>
                                <span class="size">${bytesToSize(
                                  file.size
                                )}</span>
                                <a href="#" class="link" data-url="./descargas/${fileName}">Abrir</a>
                                <span class="progress" style="display: none;">
                                    <span class="buffer"></span>
                                    <span class="percentage"></span>
                                </span>
                            </div>
                            <button class="remove">
                                <ion-icon name="close"></ion-icon>
                            </button>
                        </li>
                    `;

          // Inserta el archivo en la lista
          document
            .querySelector(".list-upload ul")
            .insertAdjacentHTML("beforeend", li);
          let li_el = document.querySelector("#" + uniq);

          // Agrega el listener al enlace "Abrir"
          li_el
            .querySelector(".link")
            .addEventListener("click", function (event) {
              event.preventDefault();
              let url = event.target.getAttribute("data-url");
              handleOpenFile(url);
            });

          // Agrega el listener al botón "Eliminar"
          li_el.querySelector(".remove").addEventListener("click", function () {
            removeFile(fileName, li_el);
          });
        });
      });
  }

  // Función para manejar la apertura o descarga de archivos
  function handleOpenFile(url) {
    if (
      confirm(
        "¿Deseas guardar el archivo o abrirlo desde la web? \nAceptar para guardar, Cancelar para abrir desde la web"
      )
    ) {
      // Descargar el archivo
      let a = document.createElement("a");
      a.href = url;
      a.download = url.split("/").pop().replace(/ /g, "_");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Abrir el archivo en la web
      window.open(url, "_blank");
    }
  }

  // Función para convertir bytes a tamaño legible
  function bytesToSize(bytes) {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
    const unit = Math.floor(Math.log(bytes) / Math.log(1024));
    return new Intl.NumberFormat("en", {
      style: "unit",
      unit: units[unit],
    }).format(bytes / 1024 ** unit);
  }

  // Función para eliminar un archivo
  function removeFile(fileName, li_el) {
    let data = new FormData();
    data.append("removefile", fileName);

    fetch("upload.php", {
      method: "POST",
      body: data,
    })
      .then((response) => response.text())
      .then(() => {
        li_el.remove();
      })
      .catch(() => {
        alert("Error al eliminar el archivo.");
      });
  }
});
