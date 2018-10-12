'use strict';

const POWERBALL_URL = 'https://data.ny.gov/api/views/d6yy-54nr/rows.json';
const MEGAMILLIONS_URL = 'https://data.ny.gov/api/views/5xaw-6ayf/rows.json';

const STORE = {
    drawings: [
        {name: "Powerball",
        date: new Date(),   // new is an object constructor 
        numbers: [2,3,4,5,6,18,2],
    },
    {name: "MegaMillions",
    date: new Date(),
    numbers: [2,3,4,5,6,18,2],
    },
    ],
    newsItems: [],


}

//// API functions //////////
/*
need to chain one after the other, first has to pass info to the second items
idea is to edit STORE each time and then after the scond time update the page.
*/


function getDataFromApi(url, success, error) {
    const settings = {
        url, 
        type: 'GET',
        dataType: 'json',
        success,
        error,
    }
    $.ajax(settings);
}

function getPowerballDataFromApi(success, error) {
    getDataFromApi(POWERBALL_URL, success, error);
}

function getMegaMillionsDataFromApi(success, error) {
    getDataFromApi(MEGAMILLIONS_URL, success, error);
}

function getLotteryDataFromApi(powerBallSuccess, megaMillionsSuccess, powerBallError, megaMillionsError) {
    
    getPowerballDataFromApi(powerBallSuccess, powerBallError);
    getMegaMillionsDataFromApi(megaMillionsSuccess,megaMillionsError);
}







////// GENERATE  //////////////////////////////////////////////////////////////////////////////////////////////////////

function generateMainPage() {
   // might not need this
}

function generateNavItem(drawing) {
    return `
    <li class="navitem">
        <a class="navlink" data-drawing="${drawing.name.toLowerCase()}">${drawing.name} History</a>
    </li>
    `
}


function generateNavSection(drawings) {
    //
    return `
    <section id="navsection">
        <ul id="navlist">
            ${drawings.map(generateNavItem).join("\n")}
        </ul>
    </section>
    `
}

function generateNewsSection(newsItems) {
    //
    return `
    <section id="newssection">
        <h2>Lotto in the News</h2>
        <ul id="newslist">
            <li class="newsarticle">
                <img class="newsimage">
                <h3>Headline</h3>
                <a class="readmorelink">Read More</a>
            </li>
        </ul>
    </section>
    `
}

function generateNumberSection(drawings) {
    //
    return `
    <section id="numbersection">
        <ul>
            ${drawings.map(generateDrawingItem)}
        </ul>
    </section>
    `
}


// for each drawing in drawings, map it on to generatedrawing items
/* {name: "Powerball",
    date: 2/3/2018,
    numbers: [2,3,4,5,6,18,2],
}
adapter from api to app (so if the api changes, then you just need to change the adapter)  
called programming to contract - adjusting at the point of the adapter so you dont violate the contract

**i need to write a piece that gets the data form the api and returns the type of object above.  it will ask the adapter for the data and then the adpater will get from the api.

*/


function generateDrawingItem(drawing) {
    // 
    const numberList = generateNumbersList(drawing.numbers);
    const countDown = generateCountDown(drawing.name, drawing.date) ;
    return `
    <li id="${drawing.name.toLowerCase()}listitem">
        <h2>${drawing.name}</h2>
            ${numberList}
            ${countDown}
        <a class="neareststore" data-drawing="${drawing.name.toLowerCase()}">Find Nearest Store</a>
    </li>
    `
}

function generateNumbersList(numbers) {
    // need to use double quotes.  single quotes dont interpret so it would be a backslash and n, not a new line.
    const numberList = numbers.map(number => { return `<li class="numberitem">${number}</li>` }).join("\n");
    return `
    <ul class="numberslist">
        ${numberList}
    </ul>
    `
}

function generateCountDown(drawingName, drawingDate) {
    const today = new Date();
    const daysLeft = 2;
    const hoursLeft = 2;
    const minutesLeft = 2;
    return `
    <h3>Next ${drawingName} Drawing</h3>
    <div class="countdown">
        <span class="days">${daysLeft}</span>
        <span class="hours">${hoursLeft}</span>
        <span class="minutes">${minutesLeft}</span>
    </div>
    `
}

function generateNewsItem(newsItem) {
    //
    return `
    <section id="newssection">
        <h2>Lotto in the News</h2>
        <ul id="newslist">
            <li class="newsarticle">
                <img class="newsimage">
                <h3>Headline</h3>
                 <a class="readmorelink">Read More</a>
            </li>
        </ul>
    </section>
    `
}

///// display ////////////////////////////////////////////////////////////////////////////////////////////////////////

function appendOrReplace(items, container, generator, append = true) {
    const html = generator(items);
    if (append) {
        container.append(html);
    } else {
        container.html(html);
    }
}

function displayNumberSection(drawings, container, append = true) {
    appendOrReplace(drawings, container, generateNumberSection, append);
}

function displayMainPage(drawings, newsItems) {
    const main = $('main')
    main.empty();  // this empties it out so that we can do a bunch of appends
    displayNumberSection(drawings, main);
    displayNavSection(drawings, main);
    displayNewsSection(newsItems, main);
}

function displayNavSection(drawings, container, append = true) {
    appendOrReplace(drawings, container, generateNavSection, append);
}

function displayNewsSection(newsItems, container, append = true) {
    appendOrReplace(newsItems, container, generateNewsSection, append);
}

function displayDrawingItem(drawing, container) {
    // 
}

function displayNumbersList(numbers, container) {
    container.html(generateNumbersList(numbers));
}
function displayCountDown(drawing, container) {
    //
}
function displayNewsItem(newsItem) {
    //
}


//// EVENT HANDLERS //////////////////////////////////////////////////////////////////////////////////////////

function setUpEventHandlers() {

}

function initalize() {
    setUpEventHandlers();
    displayMainPage(STORE.drawings, STORE.newsItems);

}

$(initalize);


// make dummy data, call display page





