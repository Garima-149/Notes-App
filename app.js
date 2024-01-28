//DOM selectors
showNotes();
const addbtn = document.getElementById("addBtn");
const done = document.getElementById("editBtn");
const addtext = document.getElementById("addTxt");
const searchTxt = document.getElementById("searchTxt");
const heading = document.getElementById("heading");
const volumeButton = document.getElementById("mute-button");
const styledMessageContainer = document.getElementById("styled-message-container");
let styledTitle = document.getElementById("styled-title");
done.style.visibility = "hidden";

//Event listeners
addbtn.addEventListener("click", addaNote);
searchTxt.addEventListener("keypress", function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchtext();
  }
});

//Functions
function showNotes(searchTerm = "") {
  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesArray = [];
  } else {
    notesArray = JSON.parse(notes);
  }

  let filteredNotes = notesArray.filter(function (element) {
    let cardTitle = element.title.toLowerCase();
    let cardTxt = element.text.toLowerCase();

    return cardTitle.includes(searchTerm) || cardTxt.includes(searchTerm);
  });

  let html = "";
  let groupedNotes = {};

  filteredNotes.forEach(function (element) {
    const label = element.label || "Uncategorized";
    if (!groupedNotes[label]) {
      groupedNotes[label] = [];
    }
    groupedNotes[label].push(element);
  });

  for (const label in groupedNotes) {
    html += `<h3>${label}</h3>`;
    groupedNotes[label].forEach(function (element, index) {
      let fontColor = isLightColor(element.color || '#ffffff') ? 'black' : 'white';
      html += `
        <div class="noteCard my-2 card" style="width: 18rem; background-color: ${element.color || '#ffffff'}; color: ${fontColor};">
          <div class="card-body">
            <div style="display:flex; justify-content:space-between;" >
              <h5 class="card-title">${element.title}</h5>
              <div style="position:relative; left:0; cursor:pointer">
              
                <i id="${index}" onclick="editNote(this.id)" class="fas fa-edit btn btn-primary"></i>
                <i id="${index}" onclick="deleteNote(this.id)" class="fas fa-trash-alt btn btn-danger"></i>
              </div>
            </div>
            <p class="card-text">${element.text}</p>
          </div>
        </div>`;
    });
  }

  let notesElm = document.getElementById("notes");
  if (filteredNotes.length !== 0) {
    notesElm.innerHTML = html;
  } else {
    notesElm.innerHTML = `No matching notes found. Use "Add a Note" section to add notes.`;
  }

  notesElm.style.color = "rgb(115, 115, 115)";
  notesElm.style.fontSize = "20px";
}

function addaNote() {
  const audio = document.querySelector(".sound");
  const notes = localStorage.getItem("notes");
  if (notes == null) {
    notesArray = [];
  } else {
    notesArray = JSON.parse(notes);
  }

  const selectedColor = document.getElementById("backgroundColorPicker").value;

  let useDefaultTitle = document.getElementById("useDefaultTitle").checked;
  let label = document.getElementById("labelInput").value.trim() || null;

  if (addtext.value !== "") {
    if (useDefaultTitle) {
      let title = getDefaultTitle(addtext.value);
      notesArray.push({ label: label, title: title, text: addtext.value, color: selectedColor });
      localStorage.setItem("notes", JSON.stringify(notesArray));
      addtext.value = "";
      heading.value = "";
      $(".toast").toast("show");
      if (volumeButton.classList.contains('fa-volume-up')) {
        audio.play();
      }
    } else {
      if (heading.value === "") {
        styledTitle.innerHTML =
          '<div class="alert alert-warning" role="alert" style="background: #b5f2fb;">Title cannot be empty! Please enter a title or check the below box for default title</div>';
        setTimeout(() => {
          styledTitle.innerHTML = "";
        }, 4000);
      } else {
        let title = heading.value;
        notesArray.push({ label: label, title: title, text: addtext.value, color: selectedColor });
        localStorage.setItem("notes", JSON.stringify(notesArray));
        addtext.value = "";
        heading.value = "";
        $(".toast").toast("show");
        if (volumeButton.classList.contains('fa-volume-up')) {
          audio.play();
        }
      }
    }
  } else {
    styledMessageContainer.innerHTML =
      '<div class="alert alert-warning" role="alert">Notes cannot be empty!</div>';
    setTimeout(() => {
      styledMessageContainer.innerHTML = "";
    }, 2000);
  }
  showNotes();
}

//Function to determine if the background color is light or dark

function isLightColor(hexColor) {

  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}

// Function to get default title from the first two words of text
function getDefaultTitle(text) {
  let words = text.split(" ");
  return words.length >= 2 ? `${words[0]} ${words[1]}` : text;
}

function editNote(index) {
  addbtn.style.visibility = "collapse";
  done.style.visibility = "visible";
  const notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }
  heading.value = notesObj[index].title.replace(/ \(Edited\) .*/, '');
  addtext.value = notesObj[index].text;

  done.onclick = () => {
    const updatedHeading = heading.value.trim();
    const updatedAddText = addtext.value.trim();

    if (!updatedAddText) {
      window.alert("Note cannot be empty. Your item will be deleted.");
      notesObj.splice(index, 1);
      localStorage.setItem("notes", JSON.stringify(notesObj));
      showNotes();
    } else {
      let headingString = updatedHeading;

      // Check if "Use Default Title" option is checked
      if (document.getElementById("useDefaultTitle").checked) {
        // Use the first two words of addtext as the title
        const words = updatedAddText.split(" ");
        headingString = words.length >= 2 ? `${words[0]} ${words[1]}` : updatedHeading;
      }

      // Check if heading is not empty before appending "(Edited) " + " " + n
      if (headingString) {
        headingString += " (Edited) " + new Date().toLocaleTimeString();
        notesObj[index].title = headingString;
        notesObj[index].text = updatedAddText;
        localStorage.setItem("notes", JSON.stringify(notesObj));
        showNotes();
        heading.value = "";
        addtext.value = "";
        addbtn.style.visibility = "visible";
        done.style.visibility = "hidden";
      } else {
        window.alert("Heading cannot be empty.");
      }
    }
  };
}




function deleteNote(index) {
  const notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }
  const confirmation = window.confirm("Are you sure you want to delete this note?");
  
  if (confirmation) {

    notesObj.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notesObj));
    showNotes();
    
  }

}

function searchtext() {
  let inputVal = searchTxt.value.toLowerCase();

  const cardy = document.getElementsByClassName("card");
  for (let i = 0; i < cardy.length; i++) {
    cardy[i].style.display = "none";
  }
  let heading = document.querySelector("h1");
  if (heading) {
    heading.style.display = "none";
  }
  showNotes(inputVal);
}

function setTheme(themeName) {
  // localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
}

function toggleTheme() {
  var slider = document.getElementById("slider");
  var icon = document.getElementById("icon");

  if (slider.checked) {
    setTheme("theme-dark");
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    setTheme("theme-light");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
}

(function () {
  if (localStorage.getItem("theme") === "theme-dark") {
    setTheme("theme-dark");
    document.getElementById("slider").checked = false;
    document.getElementById("icon").classList.remove("fa-sun");
    document.getElementById("icon").classList.add("fa-moon");
  } else {
    setTheme("theme-light");
    document.getElementById("slider").checked = true;
    document.getElementById("icon").classList.remove("fa-moon");
    document.getElementById("icon").classList.add("fa-sun");
  }
})();

function toggleMute() {
  if (volumeButton.classList.contains("fa-volume-mute")) {
    volumeButton.classList.remove("fa-volume-mute");
    volumeButton.classList.add("fa-volume-up");
  } else {
    volumeButton.classList.remove("fa-volume-up");
    volumeButton.classList.add("fa-volume-mute");
  }
}
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("scroll", function () {
    var scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY > 200) {
      document.querySelector('.scroll-up-btn').classList.add("show");
    } else {
      document.querySelector('.scroll-up-btn').classList.remove("show");
    }
  });

  document.querySelector('.scroll-up-btn').addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
