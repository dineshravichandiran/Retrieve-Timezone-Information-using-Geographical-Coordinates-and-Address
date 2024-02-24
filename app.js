const apiKey = `f6372ba6e2b94cd6b258df60b222b37c`;
const table = document.getElementById("Current-time-table");
const form = document.getElementById("address-time-zone-form");
const addresErrDiv = document.getElementById("error-message");
const resultWrraperDiv = document.getElementById("result-table-wrraper")

let nameOfTimeZone;
let lat;
let long;
let offsetSTD;
let offsetSTDSeconds;
let offsetDST;
let offsetDSTSeconds;
let country;
let postcode;
let city;


// finding users current location 
function latLongFinder() {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                lat = position.coords.latitude;
                long = position.coords.longitude;
                resolve({ lat, long })
            })
        } else {
            reject("Geolocation is not supported by this browser.")
        }
    })
}

latLongFinder()
    .then((data) => {
        // seting latitude and longitude values first 
        table.rows[1].cells[1].innerText = data.lat;
        table.rows[1].cells[3].innerText = data.long;
        return fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data.lat}&lon=${data.long}&format=json&apiKey=${apiKey}`)
    }).then((fetechedData) => {
        return fetechedData.json();
    }).then((timeZone) => {
        return timeZone.results
    }).then((obj) => {

        // setting result values in current timezone 
        nameOfTimeZone = obj[0].timezone.name;
        offsetSTD = obj[0].timezone.offset_STD;
        offsetDSTSeconds = obj[0].timezone.offset_STD_seconds;
        offsetDST = obj[0].timezone.offset_DST;
        offsetSTDSeconds = obj[0].timezone.offset_DST_seconds
        city = obj[0].city
        country = obj[0].country
        postcode = obj[0].postcode

        table.rows[0].cells[1].innerText = nameOfTimeZone;
        table.rows[2].cells[1].innerText = offsetSTD;
        table.rows[3].cells[1].innerText = offsetSTDSeconds;
        table.rows[4].cells[1].innerText = offsetDST;
        table.rows[5].cells[1].innerText = offsetDSTSeconds;
        table.rows[6].cells[1].innerText = country;
        table.rows[7].cells[1].innerText = postcode;
        table.rows[8].cells[1].innerText = city;



    }).catch(err => {
        alert(err)
    })

// getting timezone by user input    
function timzeZoneByAddress(address) {
    const encodedAddress = encodeURIComponent(address);
    return fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`)
}

function formHandler(e) {
    e.preventDefault();
    const address = form["address"].value;
    if (!address) {
        addresErrDiv.innerText = 'Please enter an address!'
    } else {
        addresErrDiv.innerText = ''
        timzeZoneByAddress(address)
            .then(res => res.json())
            .then((data) => {

                // Clear previous results
                resultWrraperDiv.innerHTML = '';

                let resultDiv = document.createElement("div");
                resultDiv.innerHTML = `
                <h2 id="table-wrraper-head">Your Results</h2>
                <table id="address-time-table">
                <tr>
                    <td>Name Of Time Zone :</td>
                    <td>${data.features[0].properties.timezone.name}</td>
                </tr>
                <tr>
                    <td>Lat:</td>
                    <td>${data.features[0].properties.lat}</td>
                    <td>Long:</td>
                    <td>${data.features[0].properties.lon}</td>
                </tr>
                <tr>
                    <td>Offset STD:</td>
                    <td>${data.features[0].properties.timezone.offset_STD}</td>
                </tr>
                <tr>
                    <td>Offset STD Seconds:</td>
                    <td>${data.features[0].properties.timezone.offset_STD_seconds}</td>
                </tr>
                <tr>
                    <td>Offset DST:</td>
                    <td>${data.features[0].properties.timezone.offset_DST}</td>
                </tr>
                <tr>
                    <td>Offset DST Seconds:</td>
                    <td>${data.features[0].properties.timezone.offset_DST_seconds
                    }</td>
                </tr>
                <tr>
                    <td>Country:</td>
                    <td>${data.features[0].properties.country}</td>
                </tr>
                <tr>
                    <td>Postcode:</td>
                    <td>${data.features[0].properties.country.postcode}</td>
                </tr>
                <tr>
                    <td>City:</td>
                    <td>${data.features[0].properties.city}</td>
                </tr>
            </table>
            `
                resultWrraperDiv.appendChild(resultDiv)
            }).catch((err) => {
                alert(`Something went wrong ${err}`)
            })
    }
    event.target.reset();

}

form.addEventListener("submit", formHandler)