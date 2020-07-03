window.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.querySelector('.wrapper canvas'),
        context = canvas.getContext('2d');

    const stars = [];
    const asteroids = [];
    const fuelTanks = [];

    const spaceShip = {
        img: new Image(),
        x: 60,
        y: canvas.clientHeight / 2,
    }

    const draw = () => {
        asteroids.forEach(asteroid => {
            if (
                (asteroid.x < spaceShip.x + spaceShip.img.width &&
                    asteroid.x + asteroid.img.width > spaceShip.x) &&
                (asteroid.y + asteroid.img.height > spaceShip.y &&
                    asteroid.y < spaceShip.y + spaceShip.img.height)) {
                console.log("collision")
            }
        });
        fuelTanks.forEach(fuelTank => {
            if (
                (fuelTank.x < spaceShip.x + spaceShip.img.width &&
                    fuelTank.x + fuelTank.img.width > spaceShip.x) &&
                (fuelTank.y + fuelTank.img.height > spaceShip.y &&
                    fuelTank.y < spaceShip.y + spaceShip.img.height)) {
                console.log("fulfiled")
            }
        });
        context.drawImage(spaceShip.img, spaceShip.x, spaceShip.y);
        requestAnimationFrame(draw);
    }

    const init = () => {
        const ctxWidth = window.innerWidth,
            ctxHeight = window.innerHeight;

        const asteroidImg = new Image(),
            fuelTankImg = new Image();

        asteroidImg.src = '../assets/asteroid.png';
        fuelTankImg.src = '../assets/fuel_tank.gif';
        spaceShip.img.src = '../assets/spaceship.png';

        for (let i = 0; i < 100; i++) {
            stars.push({
                size: 0 | Math.random() * 3 + 1,
                x: 0 | Math.random() * ctxWidth,
                y: 0 | Math.random() * ctxHeight
            });
            if (i % 10 == 0)
                stars[i].isClose = true;
        }

        for (let i = 0; i < 5; i++) {
            asteroids.push({
                img: asteroidImg,
                x: 0 | Math.random() * ctxWidth + ctxWidth,
                y: 0 | Math.random() * ctxHeight - 60
            });
        }

        for (let i = 0; i < 2; i++) {
            fuelTanks.push({
                img: fuelTankImg,
                x: 0 | Math.random() * ctxWidth + ctxWidth,
                y: 0 | Math.random() * ctxHeight - 60
            });
        }

        drawBackground(true);

        spaceShip.img.onload = () => {
            draw();
        }
    }

    const drawBackground = (isResized) => {
        const ctxHeight = window.innerHeight,
            ctxWidth = window.innerWidth,
            background = context.createLinearGradient(0, 0, 0, ctxHeight * 2);

        if (isResized) {
            canvas.setAttribute("width", ctxWidth);
            canvas.setAttribute("height", ctxHeight);
        }

        context.clearRect(0, 0, ctxWidth, ctxHeight);

        background.addColorStop(0, "#141418");
        background.addColorStop(1, "#2b2551");

        context.rect(0, 0, ctxWidth, ctxHeight);
        context.fillStyle = background;
        context.fill();

        drawStars();
        drawAsteroids();
        drawFuelTanks();
    }

    const drawStars = () => {
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.shadowBlur = 10;
        context.shadowColor = "white";

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
    }, 200);


    const slideAsteroids = setInterval(() => {
        asteroids.forEach(asteroid => {
            if (asteroid.x < -60) {
                asteroid.x = window.innerWidth + 100
                asteroid.y = 0 | Math.random() * window.innerHeight
            } else asteroid.x -= 10;
        });
        drawBackground()
    }, 100);

    const slideFuelTanks = setInterval(() => {
        fuelTanks.forEach(fuelTank => {
            if (fuelTank.x < -60) {
                fuelTank.x = window.innerWidth + 100
                fuelTank.y = 0 | Math.random() * window.innerHeight
            } else fuelTank.x -= 10;
        });
        drawBackground()
    }, 100);

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
});