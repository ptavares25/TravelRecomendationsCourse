// Holds the data once it has been loaded, so the search can use it
let travelData = null;

// Folder where your own images are stored
const IMAGE_FOLDER = "images/";

// Keyword variations the search accepts (always compared in lowercase)
const BEACH_KEYWORDS = ["beach", "beaches"];
const TEMPLE_KEYWORDS = ["temple", "temples"];
const COUNTRY_KEYWORDS = ["country", "countries"];

// Your image files use the same names as the JSON (e.g. "enter_your_image_for_sydney.jpg")
// and are stored in the images folder, e.g. "images/enter_your_image_for_sydney.jpg".
function getImagePath(imageUrl) {
    return IMAGE_FOLDER + imageUrl;
}

// ---------- 1. Load the data ----------
fetch("travel_recommendation_api.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Could not load data: " + response.status);
        }
        return response.json();
    })
    .then(function (data) {
        // Point every imageUrl to your own image
        data.countries.forEach(function (country) {
            country.cities.forEach(function (city) {
                city.imageUrl = getImagePath(city.imageUrl);
            });
        });
        data.temples.forEach(function (temple) {
            temple.imageUrl = getImagePath(temple.imageUrl);
        });
        data.beaches.forEach(function (beach) {
            beach.imageUrl = getImagePath(beach.imageUrl);
        });

        travelData = data;
        console.log("Travel data:", data);
    })
    .catch(function (error) {
        console.error("Error fetching travel data:", error);
    });

// ---------- 2. Find the places that match a keyword ----------
function findRecommendations(keyword) {
    // "beach", "Beach", "BEACH" and "beaches" all work
    if (BEACH_KEYWORDS.includes(keyword)) {
        return travelData.beaches;
    }

    // "temple", "Temple", "TEMPLES", ...
    if (TEMPLE_KEYWORDS.includes(keyword)) {
        return travelData.temples;
    }

    // "country" or "countries" shows the cities of every country
    if (COUNTRY_KEYWORDS.includes(keyword)) {
        let allCities = [];
        travelData.countries.forEach(function (country) {
            allCities = allCities.concat(country.cities);
        });
        return allCities;
    }

    // A country name, e.g. "japan" or "Brazil", shows that country's cities
    const country = travelData.countries.find(function (c) {
        return c.name.toLowerCase() === keyword;
    });
    if (country) {
        return country.cities;
    }

    return [];
}

// ---------- 3. Show the results on the page ----------
function showResults(places) {
    const resultsDiv = document.getElementById("results");
    const grid = document.getElementById("resultsGrid");
    grid.innerHTML = "";

    // Swap the introduction for the results
    document.querySelector(".intro").style.display = "none";
    resultsDiv.style.display = "block";

    if (places.length === 0) {
        const message = document.createElement("p");
        message.className = "no-results";
        message.textContent =
            "No recommendations found. Try \"beach\", \"temple\", \"country\" " +
            "or a country name such as \"Japan\".";
        grid.appendChild(message);
        return;
    }

    // One card per place: image, name and description
    places.forEach(function (place) {
        const card = document.createElement("div");
        card.className = "result-card";

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = place.name;

        const title = document.createElement("h3");
        title.textContent = place.name;

        const description = document.createElement("p");
        description.textContent = place.description;

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(description);
        grid.appendChild(card);
    });
}

// ---------- 4. Search only when the Search button is clicked ----------
function search() {
    const input = document.getElementById("searchInput").value;
    const keyword = input.trim().toLowerCase();

    if (keyword === "") {
        return;
    }

    if (travelData === null) {
        console.error("The travel data has not loaded yet.");
        return;
    }

    const results = findRecommendations(keyword);
    console.log("Results for \"" + keyword + "\":", results);
    showResults(results);
}

// ---------- 5. Clear the search box and the results ----------
function clearResults() {
    document.getElementById("searchInput").value = "";
    document.getElementById("resultsGrid").innerHTML = "";
    document.getElementById("results").style.display = "none";
    document.querySelector(".intro").style.display = "block";
}

document.getElementById("btnSearch").addEventListener("click", search);
document.getElementById("btnClear").addEventListener("click", clearResults);
