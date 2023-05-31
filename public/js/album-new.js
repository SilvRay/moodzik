// Récupère les éléments de la page
const trackSearch = document.getElementById("track-search");
const searchResults = document.getElementById("search-results");

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

          $p.addEventListener("click", function () {
            console.log("Click sur l'élément track", trackSearch);
            numTrack += 1;

            const $pList = document.createElement("p");
            $pList.innerHTML = `${numTrack} ${$p.textContent}`;

            const $input = document.createElement("input");
            $input.type = "hidden";

            $input.value = trackList.appendChild($pList);

            const validateBtn = document.querySelector(".val-btn");

            if (trackList.childElementCount >= 8) {
              validateBtn.disabled = false;
            } else {
              validateBtn.disabled = true;
            }

            trackSearch.dataset.trackid = item.id;

            trackSearch.value = this.textContent;
          });
        });
      })

      .catch((error) => console.error("Error:", error)); // Affiche une erreur si une erreur se produit
  } else {
    // Si la requête a 2 caractères ou moins, vide le conteneur des résultats de la recherche
    searchResults.innerHTML = "";
  }
});

const addBtn = document.getElementById("add");
const trackList = document.querySelector(".tracks-list");
let numTrack = 0;

// Ajoute un évènement "click" au boutton "Add"
addBtn.addEventListener("click", function () {
  console.log("coucou", trackList.childElementCount);

  // numTrack += 1;

  // const $p = document.createElement("p");
  // $p.innerHTML = `${numTrack} ${trackSearch.value}`;

  // const $input = document.createElement("input");
  // $input.type = "hidden";
  // $input.value = trackList.appendChild($p);
  // $input.data.trackid = item.id;

  // const validateBtn = document.querySelector(".val-btn");

  // if (trackList.childElementCount >= 3) {
  //   validateBtn.disabled = false;
  // } else {
  //   validateBtn.disabled = true;
  // }
});
