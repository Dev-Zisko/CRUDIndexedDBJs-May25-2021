"use strict";

const IDBRequest = indexedDB.open("database", 1); // Nombre de la base de datos, si esta creada y si no la crea.

IDBRequest.addEventListener("upgradeneeded", () => { 
	const db = IDBRequest.result;
	db.createObjectStore("nombres", {
		autoIncrement: true
	});
	console.log("Se creo correctamente.");
});

IDBRequest.addEventListener("success", () => { 
	leerObjetos();
});

IDBRequest.addEventListener("error", () => { 
	console.log("Todo mal."); 
});

document.getElementById('add').addEventListener("click", () => {
	let nombre = document.getElementById("nombre").value;
	if (nombre.length > 0) {
		if (document.querySelector(".posible") != undefined) {
			if (confirm("Hay elementos sin guardar, Quieres continuar?")) {
				addObjeto({nombre});
				leerObjetos();
			}
		} else {
			addObjeto({nombre});
			leerObjetos();
		}
	}
	document.getElementById("nombre").value = "";
});

const addObjeto = objeto => {
	const IDBData = getIDBData("readwrite", "Objeto agregado correctamente");
	IDBData.add(objeto);
}

const leerObjetos = () => {
	const IDBData = getIDBData("readonly");
	const cursor = IDBData.openCursor();
	const fragment = document.createDocumentFragment();
	document.querySelector(".nombres").innerHTML = "";
	cursor.addEventListener("success", () => {
		if (cursor.result) {
			let elemento = nombresHTML(cursor.result.key, cursor.result.value);
			fragment.appendChild(elemento);
			cursor.result.continue();
		}
		else {
			document.querySelector(".nombres").appendChild(fragment);
		}
	});
}

const modificarObjeto = (key, objeto) => {
	const IDBData = getIDBData("readwrite", "Objeto modificado correctamente");
	IDBData.put(objeto, key);
}

const eliminarObjeto = key => {
	const IDBData = getIDBData("readwrite", "Objeto eliminado correctamente");
	IDBData.delete(key);
}

const getIDBData = (mode, msg) => {
	const db = IDBRequest.result;
	const IDBtransaction = db.transaction("nombres", mode);
	const objectStore = IDBtransaction.objectStore("nombres");
	IDBtransaction.addEventListener("complete", () => {
		console.log(msg);
	});
	return objectStore;
}

const nombresHTML = (id, name) => {
	const container = document.createElement("DIV");
	const h2 = document.createElement("H2");
	const options = document.createElement("DIV");
	const saveButton = document.createElement("BUTTON");
	const deleteButton = document.createElement("BUTTON");

	container.classList.add("nombre");
	options.classList.add("options");
	saveButton.classList.add("imposible");
	deleteButton.classList.add("delete");

	saveButton.textContent = "Guardar";
	deleteButton.textContent = "Eliminar";

	h2.textContent = name.nombre;
	h2.setAttribute("contenteditable", "true");
	h2.setAttribute("speelcheck", "false");

	options.appendChild(saveButton);
	options.appendChild(deleteButton);

	container.appendChild(h2);
	container.appendChild(options);

	h2.addEventListener("keyup", () => {
		saveButton.classList.replace("imposible", "posible");
	});

	saveButton.addEventListener("click", () => {
		if (saveButton.className == "posible") {
			modificarObjeto(id, {nombre: h2.textContent});
			saveButton.classList.replace("posible", "imposible");
		}
	});

	deleteButton.addEventListener("click", () => {
		eliminarObjeto(id);
		document.querySelector(".nombres").removeChild(container);
	});

	return container;
}