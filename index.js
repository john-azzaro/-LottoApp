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
        STORE.drawings.push(...powerBallDrawings.slice(powerBallDrawings.length - 8));                      
        
        getMegaMillionsDataFromApi(function(response) {
        const megaMillionsDrawings = megaMillionsAdapter(response.data)

        STORE.drawings.push(...megaMillionsDrawings.slice(megaMillionsDrawings.length - 8));    
        
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

////////////// countdown ///////////////
// switch is a way to have a whole bunch of if else.
// Megamillions – Tuesday and Friday   Powerball – wed sat
// switch would be used when you have one criterion with multi values and you want to do a different option based on different values.
// switch saves you a chain of else ifs ()but only if you are going through one single of criterion)
function findNextDrawing(drawingName, date) {
    const today = new Date();
    if (date.getDay() === today.getDay()) {
        return today;
    }
    let nextDay = 0;
    const lastDay = date.getDay();
    switch (drawingName) {
        case POWERBALL:
            if (lastDay === 6) {
                nextDay = 3;
            }
            else if (lastDay === 3) {
                nextDay = 6;
            }
            break;   
        case MEGAMILLIONS:
            if (lastDay === 5) {
                nextDay = 2;
            }
            else if (lastDay === 2) {
                nextDay = 5;
            }
            break;
            default: 
        return today;
    }
    while(date.getDay() !== nextDay ) {
       console.log( new Date(date.setDate(date.getDate() + 1)));
    }
    return date;
}

/////// HISTORY //////////////////////////////////////////////////////////////////////////////////////////////////////

function generateHistorySection(drawingName, drawings) {
    return `
        <section class="${drawingName.toLowerCase()}historysection hidden">    
          <h3>${drawingName} History</h3>
          <br>
            <ul class="historystyle">
                ${drawings.map(generateHistoryItem).join("\n")}
            </ul>
          <br>
            <a id="historyexit" class="historyexitstyle"><h3>Exit</h3></a>
         <section>
    `
}

function generateHistoryItem(drawing) {
return `
    <li class="historyitemstyle">
        <h3>${drawing.date}</h3>
             ${generateNumbersList(drawing.numbers, drawing.name)}
    </li>
    `
}

////// GENERATE  //////////////////////////////////////////////////////////////////////////////////////////////////////

function generateNumbersList(numbers, drawingName) {
    // need to use double quotes.  single quotes dont interpret so it would be a backslash and n, not a new line.
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
        <div class="${drawing.name.toLowerCase()}history historyhover">
            <a id="${drawing.name.toLowerCase()}historylink" class="historystyle">History</a>
        </div>
    `
}

function generateNumberSection(drawings) {
    return `
    <section class="numbersection ${drawings[0].name.toLowerCase()}container">          
            ${generateDrawingItem(drawings[0])}     
    </section>
    ${generateHistorySection(drawings[0].name, drawings)}
    `
}

function generateCountDown(drawingName, drawingDate) {
    const today = new Date();
    const nextDrawing = findNextDrawing(drawingName, drawingDate);
    const difference = nextDrawing - today;
    console.log(today);
    console.log(nextDrawing);
    console.log(difference);
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));
    const message = daysLeft > 0 ? `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "today";
    return `
    <div class="countdown ${drawingName.toLowerCase()}nextdrawing">
        <span class="days">Next draw is ${message}</span>
    </div>
    
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
        appendOrReplace(splitDrawings[splitDrawing].reverse(), container, generateNumberSection, append);
    });
}

/////// EVENT HANDLERS //////////////////////////////////////

function returnFromPowerballHistory() {
    $('main').on('click', '#historyexit', function(event) {
        $('.powerballhistorysection').addClass('hidden');
    });
}

function returnFromMegaMillionsHistory() {
    $('main').on('click', '#historyexit', function(event) {
        $('.megamillionshistorysection').addClass('hidden');
    });
}

function megaMillionsHistory() {
    $('main').on('click', '#megamillionshistorylink', function(event) {
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
    returnFromPowerballHistory();
    returnFromMegaMillionsHistory();
    megaMillionsHistory();
    powerBallHistory();
}


function initalize() {
    setUpEventHandlers();
    getLotteryDataFromApi();
}

$(initalize);