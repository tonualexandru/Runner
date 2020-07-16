// add support for different browsers
const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

const cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame;


// utulity to toggle active states of a node element
toggleClassName = (target, className) => {
    if (typeof className === undefined)
        className = 'active';

    if (target.className.indexOf(className) == -1) {
        target.classList.remove(className);
    } else {
        target.classList.add(className);
    }
}


// execute code when DOM was fully loaded
window.addEventListener('DOMContentLoaded', (event) => {

    // initiate globals
    const canvas = document.querySelector('.wrapper canvas'),
        context = canvas.getContext('2d');

    let stars = [];
    let asteroids = [];
    let fuelTanks = [];

    const spaceShip = {
        img: new Image(),
        x: 60,
        y: canvas.clientHeight / 2,
    }

    const gameOverModal = document.querySelector('#gameOverModal');
    const tryAgainBtn = document.querySelector('#tryAgainBtn');
    const goHomeBtn = document.querySelector('#goHomeBtn');

    tryAgainBtn.onclick = () => {
        gameOverModal.classList.remove('active');
        restartGame();
    }

    // game status structure
    const gameStatusData = {
        mainAnimationFrameId: 0,
        stopped: false,
        asteroidsSlidingInterval: 100,
        fuelTanksSlidingInterval: 100,
        starsSlidingInterval: 200,
        fuelCapacity: 120,
        fuelQuantity: 100,
        score: 0,
        highScore: 0
    };

    // check browser support
    if (typeof (Storage) !== "undefined") {

        // set high score from local storage if available
        gameStatusData.highScore = localStorage.getItem("highScore") || 0;

    } else {
        gameStatusData.highScore = null;
    }

    // main game routine
    const draw = () => {
        if (gameStatusData.stopped)
            return;


        // check for collision with asteroids
        asteroids.forEach(asteroid => {
            if (
                (asteroid.x < spaceShip.x + spaceShip.img.width &&
                    asteroid.x + asteroid.img.width > spaceShip.x) &&
                (asteroid.y + asteroid.img.height > spaceShip.y &&
                    asteroid.y < spaceShip.y + spaceShip.img.height)) {
                gameOver();
                return;
            }
        });

        // check for collision with fuel tanks
        fuelTanks.forEach(fuelTank => {
            if (
                (fuelTank.x < spaceShip.x + spaceShip.img.width &&
                    fuelTank.x + fuelTank.img.width > spaceShip.x) &&
                (fuelTank.y + fuelTank.img.height > spaceShip.y &&
                    fuelTank.y < spaceShip.y + spaceShip.img.height)) {
                tankUp(fuelTank);
            }
        });

        // draw space ship image
        context.drawImage(spaceShip.img, spaceShip.x, spaceShip.y);
        gameStatusData.mainAnimationFrameId = window.requestAnimationFrame(draw);
    }

    const init = () => {

        // set initial values after a game restart
        stars = [];
        asteroids = [];
        fuelTanks = [];
        gameStatusData.fuelQuantity = 100;
        spaceShip.x = 60;
        spaceShip.y = canvas.clientHeight / 2;


        // focus on canvas so user will be able to play instantly
        canvas.focus();

        const ctxWidth = window.innerWidth,
            ctxHeight = window.innerHeight;

        const asteroidImg = new Image(),
            fuelTankImg = new Image();

        asteroidImg.src = '../assets/asteroid.png';
        fuelTankImg.src = '../assets/fuel_tank.gif';
        spaceShip.img.src = '../assets/spaceship.png';


        // draw stars on random spots
        for (let i = 0; i < 100; i++) {
            stars.push({
                size: 0 | Math.random() * 3 + 1,
                x: 0 | Math.random() * ctxWidth,
                y: 0 | Math.random() * ctxHeight
            });
            if (i % 10 == 0)
                stars[i].isClose = true;
        }

        // draw asteroids on random spots
        for (let i = 0; i < 5; i++) {
            asteroids.push({
                img: asteroidImg,
                x: 0 | Math.random() * ctxWidth + ctxWidth,
                y: 0 | Math.random() * ctxHeight - 60
            });
        }

        // draw fuel tanks on random spots
        for (let i = 0; i < 2; i++) {
            fuelTanks.push({
                img: fuelTankImg,
                x: 0 | Math.random() * ctxWidth + ctxWidth,
                y: 0 | Math.random() * ctxHeight - 60
            });
        }

        drawBackground(true);

        // start to draw only when the heaviest image was loaded
        spaceShip.img.onload = () => {
            draw();
        }
    }

    const tankUp = (fuelTank) => {
        gameStatusData.fuelQuantity += 10;

        // avoid exceeding tank capacity
        if (gameStatusData.fuelQuantity > gameStatusData.fuelCapacity)
            gameStatusData.fuelQuantity = gameStatusData.fuelCapacity;

        // place consumed tank at a new position
        fuelTank.x = window.innerWidth + 100
        fuelTank.y = 0 | Math.random() * window.innerHeight
    }

    const drawScore = () => {
        context.fillStyle = 'white';
        context.font = "24px monospace";
        context.fillText("Score: " + gameStatusData.score, 20, 65);
        if (gameStatusData.highScore)
            context.fillText("High score: " + gameStatusData.highScore, 20, 90);

        // increment score at each frame
        gameStatusData.score += 1; // TODO: use a exponential funtion insead
        if (gameStatusData.score > gameStatusData.highScore) {
            gameStatusData.highScore = gameStatusData.score;
        }
    }


    const drawFuelBar = () => {

        // set fuel bar color according to the amount of fuel left
        if (gameStatusData.fuelQuantity > 70) {
            context.fillStyle = 'green';
        } else if (gameStatusData.fuelQuantity > 30) {
            context.fillStyle = 'yellow';
        } else {
            context.fillStyle = 'red';
        }
        context.beginPath();
        context.rect(20, 20, gameStatusData.fuelQuantity, 20);
        context.stroke();
        context.fill();

        // decrement fuel quantity at each frame
        gameStatusData.fuelQuantity -= .1;

        // end game if ship has ran out of fuel
        if (gameStatusData.fuelQuantity <= 0) {
            gameOver();
        }
    }

    const drawBackground = (isResized) => {

        // stop from drawing the game environment when game is stoped
        if (!gameStatusData.stopped) {

            const ctxHeight = window.innerHeight,
                ctxWidth = window.innerWidth,
                background = context.createLinearGradient(0, 0, 0, ctxHeight * 2);


            // canvas should be rerendered if function was called because of a winddow resize
            if (isResized) {
                canvas.setAttribute('width', ctxWidth);
                canvas.setAttribute('height', ctxHeight);
            }

            context.clearRect(0, 0, ctxWidth, ctxHeight);

            background.addColorStop(0, '#141418');
            background.addColorStop(1, '#2b2551');

            context.rect(0, 0, ctxWidth, ctxHeight);
            context.fillStyle = background;
            context.fill();

            // execute game environment subrutines
            // drawStars();
            drawAsteroids();
            drawFuelTanks();
            drawFuelBar();
            drawScore();
        }
    }

    const drawStars = () => {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.shadowBlur = 10;
        context.shadowColor = 'white';

        for (star of stars) {
            context.moveTo(star.x, star.y);
            context.beginPath()
            context.lineTo(star.x + star.size, star.y);
            context.lineTo(star.x, star.y + star.size);
            context.lineTo(star.x, star.y - star.size);
            context.lineTo(star.x - star.size, star.y);
            context.closePath();
            context.stroke();
        }

        // remove blur so only stars will glow
        context.shadowBlur = 0;
    }

    const drawAsteroids = () => {
        for (asteroid of asteroids) {
            context.drawImage(asteroid.img, asteroid.x, asteroid.y, 60, 60);
        }
    }

    const drawFuelTanks = () => {
        for (fuelTank of fuelTanks) {
            context.drawImage(fuelTank.img, fuelTank.x, fuelTank.y, 60, 63);
        }
    }

    const maneuverUp = () => {
        if (spaceShip.y - 100 > 0)
            spaceShip.y -= 100;
        else
            spaceShip.y = 0
    }

    const maneuverDown = () => {
        if (spaceShip.y + 100 < canvas.clientHeight - spaceShip.img.height)
            spaceShip.y += 100;
        else
            spaceShip.y = canvas.clientHeight - spaceShip.img.height;
    }

    const maneuverLeft = () => {
        if (spaceShip.x - 100 > 0)
            spaceShip.x -= 100;
        else
            spaceShip.x = 0
    }

    const maneuverRight = () => {
        if (spaceShip.x + 100 < canvas.clientWidth - spaceShip.img.height)
            spaceShip.x += 100;
        else
            spaceShip.x = canvas.clientWidth - spaceShip.img.height;
    }


    const slideStars = setInterval(() => {
        stars.forEach(star => {
            if (star.x < 0)
                star.x = window.innerWidth + 5
            else if (star.isClose)
                star.x -= 1.5;
            else
                star.x -= 0.5;
        });
        drawBackground()
    }, gameStatusData.starsSlidingInterval);


    const slideAsteroids = setInterval(() => {
        asteroids.forEach(asteroid => {
            if (asteroid.x < -60) {
                asteroid.x = window.innerWidth + 100
                asteroid.y = 0 | Math.random() * window.innerHeight
            } else asteroid.x -= 10;
        });
        drawBackground()
    }, gameStatusData.asteroidsSlidingInterval);

    const slideFuelTanks = setInterval(() => {
        fuelTanks.forEach(fuelTank => {
            if (fuelTank.x < -60) {
                fuelTank.x = window.innerWidth + 100
                fuelTank.y = 0 | Math.random() * window.innerHeight
            } else fuelTank.x -= 10;
        });
        drawBackground()
    }, gameStatusData.fuelTanksSlidingInterval);


    // handle user commands to move space ship
    document.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
            case 37:
                maneuverLeft()
                break;
            case 38:
                maneuverUp()
                break;
            case 39:
                maneuverRight()
                break;
            case 40:
                maneuverDown()
                break;
            default:
                break;
        }

        drawBackground();
    })


    init();
    window.onresize = () => {
        drawBackground(true);
    }

    let gameOver = () => {
        gameStatusData.stopped = true;
        gameStatusData.score = 0;
        gameOverModal.classList.add('active');
        window.cancelAnimationFrame(gameStatusData.mainAnimationFrameId);
        if (gameStatusData.highScore) {
            localStorage.setItem("highScore", gameStatusData.highScore);
        }
    }

    let restartGame = () => {
        init();
        gameStatusData.mainAnimationFrameId = window.requestAnimationFrame(draw);
        gameStatusData.stopped = false
    }
});