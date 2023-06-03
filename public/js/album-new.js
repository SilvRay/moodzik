// Récupère les éléments de la page
const trackSearch = document.getElementById("track-search");
const searchResults = document.getElementById("search-results");
const trackList = document.querySelector(".tracks-list");
const rmvTrack = document.querySelector(".fa-xmark");
const track = document.querySelector("track");

let numTrack = 0;

// Ajoute un événement "keyup" au champ de recherche
trackSearch.addEventListener("keyup", function () {
  // Récupère la valeur du champ de recherche
  const query = this.value;

  // Si la requête a plus de 2 caractères, lance la recherche
  if (query.length > 2) {
    fetch("/search?q=" + encodeURIComponent(query))
      .then((response) => response.json()) // Transforme la réponse en JSON
      .then((data) => {
        // Vide le conteneur des résultats de la recherche
        searchResults.innerHTML = "";

        // Pour chaque élément dans les données récupérées
        data.forEach(function (item) {
          // Ajoute le nom de la piste et le nom de l'artiste au conteneur des résultats de la recherche
          const $p = document.createElement("p");
          $p.innerHTML = `${item.name} by ${item.artists[0].name}`;
          searchResults.appendChild($p);

          // Ajoute un événement "click" au paragraphe
          $p.addEventListener("click", function () {
            numTrack += 1;

            // Ajoute le nom de la piste et le nom de l'artiste au conteneur de la liste des morceaux que contiendra l'album
            const $pList = document.createElement("p");
            $pList.innerHTML = `${numTrack} ${$p.textContent}`;
            trackList.appendChild($pList);

            // Crée un élément button pour la suppression et l'ajoute à $pList
            const $button = document.createElement("button");
            $button.textContent = "x";

            // Ajout du style au bouton
            $button.style.backgroundColor = "transparent";
            $button.style.border = "none";
            $button.style.color = "white";
            $button.style.cursor = "pointer";
            $button.style.fontSize = "30px";

            // Suppression des tracks
            rmvTrack.addEventListener("click", () => {
              trackList.removeChild(track);
            });

            $pList.appendChild($button);

            // Ajoute un listener pour supprimer le morceau et le bouton correspondant quand on clique sur le bouton
            $button.addEventListener("click", function () {
              $pList.remove();
              $input.remove();
            });

            // Crée un élément input (caché) et l'ajoute au conteneur de la liste des morceaux que contiendra l'album afin de récupérer les id de chaque morceau ajouté
            const $input = document.createElement("input");
            $input.type = "hidden";
            $input.dataset.trackid = item.id;
            $input.value = item.id;
            $input.name = "tracks";
            trackList.appendChild($input);

            // Active le bouton validate à partir de 8 morceaux ajoutés
            const validateBtn = document.querySelector(".val-btn");
            if (trackList.childElementCount >= 8) {
              validateBtn.disabled = false;
            } else {
              validateBtn.disabled = true;
            }

            // Ajoute le nom de la piste et le nom de l'artiste à l'input qui permet de rechercher les morceaux
            trackSearch.value = $p.textContent;
          });
        });
      })
      .catch((error) => console.error("Error:", error));
  } else {
    searchResults.innerHTML = "";
  }
});

function previewImage(event, imageId) {
  var reader = new FileReader();
  var imageField = document.getElementById(imageId);

  reader.onload = function () {
    if (reader.readyState === 2) {
      imageField.src = reader.result;
      imageField.style.display = "block";
    }
  };
  reader.readAsDataURL(event.target.files[0]);
}
