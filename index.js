'use strict';

const POWERBALL_URL = 'https://data.ny.gov/api/views/d6yy-54nr/rows.json';
const MEGAMILLIONS_URL = 'https://data.ny.gov/api/views/5xaw-6ayf/rows.json';
const POWERBALL = "Powerball";
const MEGAMILLIONS = "MegaMillions";

const STORE = {
    drawings: [],
    newsItems: [],
}



//// API functions //////////////////////////////////////////////////////////////////////////////////////////////////
//// NOTES: The ... put the contents of one array into another array (instead of putting the array itself in the other array)
//// or said another way, the array spread operator - instead of pushing the whole array inside, it pushes all the array items in at once

function getLotteryDataFromApi() {
    getPowerballDataFromApi(function(response) {
        const powerBallDrawings = powerBallAdapter(response.data);
        STORE.drawings.push(...powerBallDrawings.slice(powerBallDrawings.length - 10));                      
        
        getMegaMillionsDataFromApi(function(response) {
        const megaMillionsDrawings = megaMillionsAdapter(response.data)
        console.log(megaMillionsDrawings[0]);
        STORE.drawings.push(...megaMillionsDrawings.slice(megaMillionsDrawings.length - 10));    
        
        displayMainPage(STORE.drawings, STORE.newsItems);
        });
    });
}

function getPowerballDataFromApi(success, error) {
    getDataFromApi(POWERBALL_URL, success, error);
}

function getMegaMillionsDataFromApi(success, error) {
    getDataFromApi(MEGAMILLIONS_URL, success, error);
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

function splitDrawingsByName(drawings) {
    let splitDrawings = {};
    for (let i = 0; i < drawings.length; i++) {
      if (drawings[i].name in splitDrawings) {
        splitDrawings[drawings[i].name].push(drawings[i]);
      } else {
        splitDrawings[drawings[i].name] = [drawings[i]];
      }
    }
    return splitDrawings;
}

function megaMillionsAdapter(drawings) {
    const dateIndex = 8;
    const numbersIndex = 9;
    const megaBallIndex = 10;
    const multiplierIndex = 11;
    return drawings.map((drawing) => {
        const megaBallMultiplier = [drawing[megaBallIndex], drawing[multiplierIndex]];
        const numbers = drawing[numbersIndex].split(" ")
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
//// instead of new page, history is hidden

function generateHistorySection(drawingName, drawings) {
    return `
        <section class="${drawingName.toLowerCase()}historysection hidden">    
          <h3>${drawingName} History</h3>
            <ul>
                ${drawings.map(generateHistoryItem).join("\n")}
            </ul>
         <section>
    `
}

function generateHistoryItem(drawing) {
return `
    <li>
        <h3>${drawing.date}</h3>
             ${generateNumbersList(drawing.numbers, drawing.name)}
    </li>
    `
}



////// GENERATE  //////////////////////////////////////////////////////////////////////////////////////////////////////

function generateNumbersList(numbers, drawingName) {
    // need to use double quotes.  single quotes dont interpret so it would be a backslash and n, not a new line.
    console.log(drawingName);
    const numberList = numbers.map(number => { return `<li class="numberitem">${number}</li>` }).join("\n");
    return `
    <ul class="numberslist ${drawingName.toLowerCase()}numbers">
        ${numberList}
    </ul>
    `
}

function generateLogo() {
    return `
    <div class="logocontainer">
        <div class="logo"></div>
    </div>
    `
}

function generateDrawingItem(drawing) {
    const numberList = generateNumbersList(drawing.numbers, drawing.name);
    const countDown = generateCountDown(drawing.name, drawing.date);
    return `
  
        <h2 class="${drawing.name.toLowerCase()}name">${drawing.name}</h2>
            ${numberList}
            ${countDown}
        <div class="${drawing.name.toLowerCase()}history">
            <a id="${drawing.name.toLowerCase()}historylink">History</a>
        </div>

    `
}


function generateNumberSection(drawings) {
    return `

    <section class="numbersection ${drawings[0].name.toLowerCase()}container">     
      
            ${generateDrawingItem(drawings.pop())}
      
    </section>
    ${generateHistorySection(drawings[0].name, drawings)}
    `
}

function generateCountDown(drawingName, drawingDate) {
    const today = new Date();
    const daysLeft = 2;
    return `
    <div class="countdown ${drawingName.toLowerCase()}nextdrawing">
        <span class="days">Next draw in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</span>
    </div>
    
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

// reuseable - takes a buch of items, runs the generator on the item, and if true adds to the container, if false replaces the contents of container.
function appendOrReplace(items, container, generator, append = true) {
    const html = generator(items);
    if (append) {
        container.append(html);
    } else {
        container.html(html);
    }
}

function displayLogo(container) {
    $(container).append(generateLogo());
}


// takes the data and displays on page
function displayMainPage(drawings, newsItems) {
    const main = $('main')
    main.empty();                                         // this empties it out so that we can do a bunch of appends
    displayLogo(main);
    displayNumberSection(drawings, main);                 // so the "main" slot is basically to display the information
}

function displayNumbersList(numbers, container) {
    container.html(generateNumbersList(numbers));
}

function displayNumberSection(drawings, container, append = true) {
    const splitDrawings = splitDrawingsByName(drawings);
    Object.keys(splitDrawings).forEach(splitDrawing => {
        appendOrReplace(splitDrawings[splitDrawing], container, generateNumberSection, append);
    });
}

function displayNewsSection(newsItems, container, append = true) {
    appendOrReplace(newsItems, container, generateNewsSection, append);
}

function displayNewsItem(newsItem) {
}

function displayCountDown(drawing, container) {
}

function displayDrawingItem(drawing, container) {
}

/////// EVENT HANDLERS //////////////////////////////////////

function megaMillionsHistory() {
    $('main').on('click', '#megamillionshistorylink', function(event) {
        console.log('history clicked')
        $('.megamillionshistorysection').removeClass('hidden');
    });
}

function powerBallHistory() {
    $('main').on('click','#powerballhistorylink', function(event) {
        $('.powerballhistorysection').removeClass('hidden');
    });
}


///// INITIALIZATION //////////////////////////////////////////////////////////////////////////////////////////

function setUpEventHandlers() {
    megaMillionsHistory();
    powerBallHistory();
}


function initalize() {
    setUpEventHandlers();
    getLotteryDataFromApi();
}

$(initalize);