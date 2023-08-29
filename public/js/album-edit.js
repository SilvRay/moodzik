const $rmvTracks = document.querySelectorAll(".rmv-track");
const $pLists = document.querySelectorAll(".track");
const $inputs = document.querySelectorAll("#track");

$rmvTracks.forEach(($rmvTrack, index) => {
  $rmvTrack.addEventListener("click", (event) => {
    console.log("TRACK REMOVED !!!");
    $pLists[index].remove();
    $inputs[index].remove();
  });
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
