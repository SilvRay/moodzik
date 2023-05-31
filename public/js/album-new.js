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
          searchResults.innerHTML +=
            "<p class='one-track'>" +
            item.name +
            " by " +
            item.artists[0].name +
            "</p>";
        });
      })
      .catch((error) => console.error("Error:", error)); // Affiche une erreur si une erreur se produit
  } else {
    // Si la requête a 2 caractères ou moins, vide le conteneur des résultats de la recherche
    searchResults.innerHTML = "";
  }
});

const tracks = searchResults.getElementsByTagName("p");

// Parcourir tous les éléments <p>
for (let i = 0; i < tracks.length; i++) {
  let track = tracks[i];

  track.addEventListener("click", function () {
    console.log("Click sur l'élément track");
    // trackSearch.innerHTML = this.value;
  });
}

const addBtn = document.getElementById("add");
const trackList = document.getElementsByClassName("tracks-list");

// Ajoute un évènement "click" au boutton "Add"
addBtn.addEventListener("click", function () {
  // Récupère la valeur du champ de recherche
  // console.log("coucou");
  const query = trackSearch.value;

  trackList.innerHTML += "<p>" + query + "</p>";
});
