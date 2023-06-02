// Récupère les éléments de la page
const trackSearch = document.getElementById("track-search");
const searchResults = document.getElementById("search-results");
const trackList = document.querySelector(".tracks-list");

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
        // console.log("data is", data);
        // Vide le conteneur des résultats de la recherche
        searchResults.innerHTML = "";

        // Pour chaque élément dans les données récupérées
        data.forEach(function (item) {
          // Ajoute le nom de la piste et le nom de l'artiste au conteneur des résultats de la recherche
          // data.length = 5;

          const $p = document.createElement("p"); // <p>

          $p.innerHTML = `${item.name} by ${item.artists[0].name}`;

          searchResults.appendChild($p);

          // Ajoute un événement "click" au aux paragraphes
          $p.addEventListener("click", function () {
            console.log("Click sur l'élément track", trackSearch);

            numTrack += 1;

            // Ajoute le nom de la piste et le nom de l'artiste au conteneur de la liste des morceaux que contiendra l'album
            const $pList = document.createElement("p");
            $pList.innerHTML = `${numTrack} ${$p.textContent}`;
            trackList.appendChild($pList);

            // Crée un élément input (caché) et l'ajoute au conteneur de la liste des morceaux que contiendra l'album afin de récupérer les id de chaque morceau ajouté
            const $input = document.createElement("input");
            $input.type = "hidden";
            $input.dataset.trackid = item.id;
            $input.value = item.id;
            $input.name = "tracks";
            trackList.appendChild($input);

            console.log("$input:", $input);

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

      .catch((error) => console.error("Error:", error)); // Affiche une erreur si une erreur se produit
  } else {
    // Si la requête a 2 caractères ou moins, vide le conteneur des résultats de la recherche
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
