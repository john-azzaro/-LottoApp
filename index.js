'use strict';

const POWERBALL_URL = 'https://data.ny.gov/api/views/d6yy-54nr/rows.json';
const MEGAMILLIONS_URL = 'https://data.ny.gov/api/views/5xaw-6ayf/rows.json';
const POWERBALL = "Powerball";
const MEGAMILLIONS = "Megamillions";

const STORE = {
    drawings: [],
    newsItems: [],
}

//// API functions //////////////////////////////////////////////////////////////////////////////////////////////////


function getLotteryDataFromApi() {
    getPowerballDataFromApi(function(response) {
        const powerBallDrawings = powerBallAdapter(response.data);
        STORE.drawings.push(powerBallDrawings[powerBallDrawings.length - 1]);
        getMegaMillionsDataFromApi(function(response) {
        const megaMillionsDrawings = megaMillionsAdapter(response.data)
        STORE.drawings.push(megaMillionsDrawings[megaMillionsDrawings.length - 1]);
        displayMainPage(STORE.drawings, STORE.newsItems);
        });
    });
}

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

function megaMillionsAdapter(drawings) {
    console.log("running megamilions adapter")
    const dateIndex = 8;
    const numbersIndex = 9;
    const megaBallIndex = 10;
    const multiplierIndex = 11;
    return drawings.map((drawing) => {
        const megaBallMultiplier = [drawing[megaBallIndex], drawing[multiplierIndex]];
        const numbers = drawing[numbersIndex].split(" ")
        // Array spread operator - instead of pushing the whole array inside, it pushes all the array items in at once
        numbers.push(...megaBallMultiplier)
            return {
            name: MEGAMILLIONS,
            date: new Date(drawing[dateIndex]),
            numbers
        }
    });
}

function powerBallAdapter(drawings) {
    const dateIndex = 8;
    const numbersIndex = 9;
    const multiplierIndex = 10;
    return drawings.map((drawing) => {
        const numbers = drawing[numbersIndex].split(" ")
        numbers.push(drawing[multiplierIndex])
        return {
                name: POWERBALL,
                date: new Date(drawing[dateIndex]),   // makes a new date out of the date string format
                numbers
        }
    });
}


/////// HISTORY //////////////////////////////////////////////////////////////////////////////////////////////////////



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

function displayNavSection(drawings, container, append = true) {
    appendOrReplace(drawings, container, generateNavSection, append);
}



////// GENERATE  //////////////////////////////////////////////////////////////////////////////////////////////////////

function generateMainPage() {
   // might not need this
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

///// DISPLAY FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////

// reuseable - takes a buch of items, runs the generator on the item, and if true adds tot he container, if false replaces the contents of container.
function appendOrReplace(items, container, generator, append = true) {
    const html = generator(items);
    if (append) {
        container.append(html);
    } else {
        container.html(html);
    }
}

// takes the data and displays on page
function displayMainPage(drawings, newsItems) {
    const main = $('main')
    main.empty();  // this empties it out so that we can do a bunch of appends
    displayNumberSection(drawings, main);   // so the "main" slot is basically to display the information
    displayNavSection(drawings, main);
    displayNewsSection(newsItems, main);
}

// from displaymainpage, main (becomes conatiner because we might want to put it somewhere other than main).  if append is left off, its undefined, but default is true.
function displayNumberSection(drawings, container, append = true) {
    appendOrReplace(drawings, container, generateNumberSection, append);
}


function displayNewsSection(newsItems, container, append = true) {
    appendOrReplace(newsItems, container, generateNewsSection, append);
}


function displayNumbersList(numbers, container) {
    container.html(generateNumbersList(numbers));
}

function displayDrawingItem(drawing, container) {
}

function displayCountDown(drawing, container) {
}

function displayNewsItem(newsItem) {
}

///// INITIALIZATION //////////////////////////////////////////////////////////////////////////////////////////

function initalize() {
    getLotteryDataFromApi();
}

$(initalize);






