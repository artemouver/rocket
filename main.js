function init() {
    console.info("initialized animation");
    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");

    //размеры canvas
    var canW = canvas.width;
    var canH = canvas.height;

    var rect = fillArrayBackgrounds(); //два прямоугольника. 0-ой - внутренний, в котором происходит движение шаров, 1-ый - внешний, окантовка
    var coordsOfInnerRect = fillCoordsOfInnerRect(); //объект для более удобных названий для границ внутреннего прямоугольника
    var whenLastFrame = currentTime(); //время предыдущего фрейма
    //var imgCircles = fillImgCircles(); //массив картинок для шариков
    var imgRocket = document.getElementById("rocket");
    var imgRocketBg = document.getElementById("rocketBg");
    var bg = document.getElementById("bg");
    var lvl = 1; //уровень сейчас
    var score = 0;
    var heartsAll = 15;
    var hearts = 15;
    var imgHeart = document.getElementById("heart");
    var circ = []; //массив шаров, для каждого из которых указаны: x и y центра, вектора скорости по осям x и y, радиус, толщина линии, стиль заливки и стиль обводки. Задается функцией createCircles(lvl)
    createCircles(lvl); //создаем шары рандомно, но в зависимости от уровня
    var bang = document.getElementById("bang"); //sprite взрыва
    var allLvls = 20; //всего уровней
    var kNum = 10; //сколько кадров на уменьшение шарика перед взрывом
    var delCirc = [];
    eventMouseDown();   //отлавливает событие - нажатие мыши и если нажатие было совершено в пределах какого-либо шара, то присваеваем массиву кликов шара то, что на этот шар кликнули.
                        //и еще массу ставим 0, чтобы остальные шары не замечали этот шар, пока он взрывается
    eventMouseMove();
    var moveOn = false;

    requestAnimationFrame(frame);

    function currentTime() {
        return new Date().getTime();
    }

    function frame() {
        requestAnimationFrame(frame);
        ctx.clearRect(0, 0, canW, canH);
        drawFrame();
        var now = currentTime();
        var passed = now - whenLastFrame;
        whenLastFrame = now;
        move(passed);
        isWalls();
        circleBumCircle();
    }

    function drawFrame() {
        //фон
        drawBackground();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 1;
        ctx.font = "48px Lato";
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (lvl <= allLvls && hearts > 0) {
            ctx.fillText("Уровень " + lvl, 750, 50);
            ctx.strokeText("Уровень " + lvl, 750, 50);
        } else {
            ctx.fillText("Конец игры", 750, 50);
            ctx.strokeText("Конец игры", 750, 50);
            if (!moveOn)
                ctx.fillStyle = "rgb(231, 100, 86)";
            else
                ctx.fillStyle = "rgb(215, 79, 65)";
            ctx.lineWidth = 5;
            ctx.fillRect(550, 350, 400, 100);

            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 1;
            ctx.fillText("Начать заново", 750, 400);
            ctx.strokeText("Начать заново", 750, 400);


        }
        ctx.restore();

        ctx.save();
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 1;
        ctx.fillText("Счет: " + score, 1350, 750);
        ctx.strokeText("Счет: " + score, 1350, 750);
        ctx.restore();

        var coordX = 150;

        for (var i = 1; i <= hearts; i++) {
            ctx.drawImage(imgHeart, coordX, 728, 50, 46);
            coordX += 60;
        }

        if (hearts <= 0) {
            circ.splice(0, circ.length);
        }

        //что делать с каждым шариком в разных ситуациях (если на шарик нажали, если еще не нажали и если после нажатия прошло больше kNum кадров)
        for (var i = 0; i < circ.length; i++) {
            ctx.save();
            ctx.translate(circ[i].x, circ[i].y);
            var imgSize = circ[i].r * 2 - circ[i].lineW;
            //ctx.drawImage(imgRocketBg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            var a1 = circ[i].vx;
            var a2 = circ[i].vy;
            var b1 = 1;
            var b2 = 0;
            var fi = Math.acos((a1 * b1 + a2 * b2) / (Math.sqrt(Math.pow(a1, 2) + Math.pow(a2, 2)) + Math.sqrt(Math.pow(b1, 2) + Math.pow(b2, 2))));
            if (circ[i].vx >= 0 && circ[i].vy >= 0)
                ctx.rotate(Math.PI / 2 + fi);
            else if (circ[i].vx <= 0 && circ[i].vy >= 0)
                ctx.rotate(Math.PI / 2 + fi);
            else if (circ[i].vx <= 0 && circ[i].vy <= 0)
                ctx.rotate(Math.PI / 2 - fi);
            else
                ctx.rotate(Math.PI / 2 - fi);


            ctx.drawImage(imgRocket, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            //ctx.beginPath();
            //var path = ctx.arc(0, 0, circ[i].r, 0, 2 * Math.PI);
            //ctx.strokeStyle = circ[i].strokeStyle;
            //ctx.lineWidth = circ[i].lineW;
            //ctx.stroke();
            ctx.restore();
        }

        for (var i = 0; i < delCirc.length; i++) {
            if (delCirc[i].k < kNum) {
                delCirc[i].r = delCirc[i].r / 1.5;
                delCirc[i].k += 1;

                ctx.save();

                ctx.translate(delCirc[i].x, delCirc[i].y);
                var imgSize = delCirc[i].r * 2 - delCirc[i].lineW;
                var a1 = delCirc[i].vx;
                var a2 = delCirc[i].vy;
                var b1 = 1;
                var b2 = 0;
                var fi = Math.acos((a1 * b1 + a2 * b2) / (Math.sqrt(Math.pow(a1, 2) + Math.pow(a2, 2)) + Math.sqrt(Math.pow(b1, 2) + Math.pow(b2, 2))));
                if (delCirc[i].vx >= 0 && delCirc[i].vy >= 0)
                    ctx.rotate(Math.PI / 2 + fi);
                else if (delCirc[i].vx <= 0 && delCirc[i].vy >= 0)
                    ctx.rotate(Math.PI / 2 + fi);
                else if (delCirc[i].vx <= 0 && delCirc[i].vy <= 0)
                    ctx.rotate(Math.PI / 2 - fi);
                else
                    ctx.rotate(Math.PI / 2 - fi);


                ctx.drawImage(imgRocket, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
                ctx.restore();


                //ctx.beginPath();
                //var path = ctx.arc(delCirc[i].x, delCirc[i].y, delCirc[i].r, 0, 2 * Math.PI);
                //ctx.strokeStyle = delCirc[i].strokeStyle;
                //ctx.lineWidth = delCirc[i].lineW;
                //ctx.stroke();
            } else {
                var sprite_x = 441 * (delCirc[i].numFrame % 8);
                ctx.drawImage(bang, sprite_x, 0, 441, 463, delCirc[i].x - Math.round(2 * delCirc[i].firstR * 441 / 463) / 2, delCirc[i].y - delCirc[i].firstR, Math.round(2 * delCirc[i].firstR * 441 / 463), 2 * delCirc[i].firstR);
                if (delCirc[i].k % 4 == 0)
                    delCirc[i].numFrame += 1;
                delCirc[i].k += 1;
                if (delCirc[i].numFrame == 8) {
                    delCirc.splice(i, 1);
                }
                if (circ.length == 0 && delCirc.length == 0) {
                    lvl += 1;
                    if (lvl <= allLvls)
                        createCircles(lvl);
                }
            }
        }
    }

    //движение шариков
    function move(passed) {
        for (var i = 0; i < circ.length; i++) {
            circ[i].x += passed * circ[i].vx / 1000;
            circ[i].y += passed * circ[i].vy / 1000;
        }
    }

    function backMove(passed) {
        for (var i = 0; i < circ.length; i++) {
            circ[i].x -= passed * circ[i].vx / 1000;
            circ[i].y -= passed * circ[i].vy / 1000;
        }
    }

    //проверка, врезался ли шар в стену
    function isWalls() {
        for (var i = 0; i < circ.length; i++) {
            if (circ[i].x > coordsOfInnerRect.right - circ[i].fullR) {
                circ[i].vx *= -1;
                circ[i].x = coordsOfInnerRect.right - circ[i].fullR;
            }
            if (circ[i].x < coordsOfInnerRect.left + circ[i].fullR) {
                circ[i].vx *= -1;
                circ[i].x = coordsOfInnerRect.left + circ[i].fullR;
            }
            if (circ[i].y > coordsOfInnerRect.down - circ[i].fullR) {
                circ[i].vy *= -1;
                circ[i].y = coordsOfInnerRect.down - circ[i].fullR;
            }
            if (circ[i].y < coordsOfInnerRect.up + circ[i].fullR) {
                circ[i].vy *= -1;
                circ[i].y = coordsOfInnerRect.up + circ[i].fullR;
            }
        }
    }

    //врезались ли шары и как им отскакивать. Также функция обеспечивает, что шар не залетит на другой
    function circleBumCircle() {
        for (var i = 0; i < circ.length; i++) {
            for (var j = i + 1; j < circ.length; j++) {
                var d = distanceBetweenCircles(i, j);
                if (d < circ[i].fullR + circ[j].fullR) {
                    var v1 = Math.sqrt(Math.pow(circ[i].vx, 2) + Math.pow(circ[i].vy, 2));
                    var v2 = Math.sqrt(Math.pow(circ[j].vx, 2) + Math.pow(circ[j].vy, 2));
                    var m1 = circ[i].m;
                    var m2 = circ[j].m;
                    var teta1 = Math.atan2(circ[i].vy, circ[i].vx);
                    var teta2 = Math.atan2(circ[j].vy, circ[j].vx);
                    var fi = Math.atan((circ[j].y - circ[i].y) / (circ[j].x - circ[i].x));

                    circ[i].vx = (v1 * Math.cos(teta1 - fi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(teta2 - fi)) / (m1 + m2) * Math.cos(fi) + v1 * Math.sin(teta1 - fi) * Math.cos(fi + Math.PI / 2);
                    circ[i].vy = (v1 * Math.cos(teta1 - fi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(teta2 - fi)) / (m1 + m2) * Math.sin(fi) + v1 * Math.sin(teta1 - fi) * Math.sin(fi + Math.PI / 2);
                    circ[j].vx = (v2 * Math.cos(teta2 - fi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(teta1 - fi)) / (m1 + m2) * Math.cos(fi) + v2 * Math.sin(teta2 - fi) * Math.cos(fi + Math.PI / 2);
                    circ[j].vy = (v2 * Math.cos(teta2 - fi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(teta1 - fi)) / (m1 + m2) * Math.sin(fi) + v2 * Math.sin(teta2 - fi) * Math.sin(fi + Math.PI / 2);

                    while (d < circ[i].fullR + circ[j].fullR) {
                        moveTwoCircle(i, j, 16);
                        d = distanceBetweenCircles(i, j);
                    }
                }
            }
        }
    }

    function sq(quadra) {
        return quadra * 2 - 1;
    }

    function isNotIntersection2(x, y, i) {
        var boo = true;
        if (x >= coordsOfInnerRect.right - circ[i].fullR && x <= coordsOfInnerRect.left + circ[i].fullR && y >= coordsOfInnerRect.down - circ[i].fullR && y <= coordsOfInnerRect.up + circ[i].fullR)
            boo = false;
        for (var j = 0; j < circ.length; j++) {
            if (j != i) {
                if (Math.sqrt(Math.pow(x - circ[j].x, 2) + Math.pow(y - circ[j].y, 2)) <= circ[i].fullR + circ[j].fullR) {
                    boo = false;
                }
            }
        }
        return boo;
    }

    //функция для разъединения шаров
    function moveTwoCircle(i, j, passed) {
        circ[i].x += passed * circ[i].vx / 1000;
        circ[i].y += passed * circ[i].vy / 1000;
        circ[j].x += passed * circ[j].vx / 1000;
        circ[j].y += passed * circ[j].vy / 1000;
    }

    //считает расстояние между центрами окружностей
    function distanceBetweenCircles(i, j) {
        return Math.sqrt(Math.pow(circ[i].x - circ[j].x, 2) + Math.pow(circ[i].y - circ[j].y, 2));
    }

    //создаем шары
    function createCircles(level) {
        var n = level;
        var lw = 3;
        var fs = "rgba(24, 255, 196, 0.5)";
        var ss = "rgb(251, 120, 81)";
        var k = 0;          //k - счетчик кадров после нажатия на шар, первые 5 кадров шар уменьшается, потом происходит взрыв (с помощью k можно замедлить анимацию взрыва). Пришлось сделать массив,
                            //т.е. отдельный k для каждого шарика, иначе баги
        var numFrame = 0;   //numFrame - счетчик sprite. Считает какой кадр sprite запустить. Пришлось сделать массив,
                            //т.е. отдельный numFrame для каждого шарика, иначе баги
        var rmin;
        var rmax;
        var v = Math.round(Math.sqrt(2500 * (level - 1)) + 100);

        if (level == 1) {
            rmin = 200;
            rmax = 200;
        } else if (level > 1 && level < 16) {
            rmin = Math.round(129 / (level + 0.225) + 42);
            rmax = Math.round(154.6 / (level + 0.225) + 50.5);
        } else {
            rmin = Math.round(2965 / (level + 60) + 11);
            rmax = Math.round(4300 / (level + 68) + 8.8);
        }

        for (var i = 0; i < n; i++) {
            circ.push({
                r: Math.floor(Math.random() * (rmax - rmin + 1)) + rmin,
                vx: Math.floor(Math.random() * (v + 1)),
                lineW: lw,
                fillStyle: fs,
                strokeStyle: ss
            });
            circ[i].vy = v - circ[i].vx;
            circ[i].m = circ[i].r;
            circ[i].fullR = circ[i].r + circ[i].lineW / 2;

            circ[i].firstR = circ[i].r;

            circ[i].k = k;
            circ[i].numFrame = numFrame;
        }
        random();
    }

    //задает месторасположение шаров в рандомных местах, но соблюдая условие, что они не должны пересекаться со стенами и с другими уже созданными шарами
    function random() {
        for (var i = 0; i < circ.length; i++) {
            while (true) {
                var rw = Math.floor(Math.random() * (coordsOfInnerRect.right - coordsOfInnerRect.left + 1)) + coordsOfInnerRect.left;
                var rh = Math.floor(Math.random() * (coordsOfInnerRect.down - coordsOfInnerRect.up + 1)) + coordsOfInnerRect.up;
                if (isNotIntersection(rw, rh, i))
                    break;
            }
            circ[i].x = rw;
            circ[i].y = rh;
        }
    }

    //проверяет, нет ли пересечений со стенами и с другими шарами
    function isNotIntersection(x, y, i) {
        var boo = true;
        if (x >= coordsOfInnerRect.right - circ[i].fullR && x <= coordsOfInnerRect.left + circ[i].fullR && y >= coordsOfInnerRect.down - circ[i].fullR && y <= coordsOfInnerRect.up + circ[i].fullR)
            boo = false;
        for (var j = 0; j < i; j++) {
            if (Math.sqrt(Math.pow(x - circ[j].x, 2) + Math.pow(y - circ[j].y, 2)) <= circ[i].fullR + circ[j].fullR) {
                boo = false;
            }
        }
        return boo;
    }

    function fillArrayBackgrounds() {
        return [
            {
                x: 150,
                y: 100,
                w: 1200,
                h: 600,
                lineW: 3,
                fillStyle: "rgb(151, 242, 201)",
                strokeStyle: "rgb(255, 69, 0)"
            },
            {
                x: 0,
                y: 0,
                w: canW,
                h: canH,
                lineW: 0,
                fillStyle: "rgb(16, 45, 60)",
                strokeStyle: "rgb(0, 0, 0)"
            }
        ]
    }

    function fillCoordsOfInnerRect() {
        return {
            up: rect[0].y,
            left: rect[0].x,
            right: rect[0].x + rect[0].w,
            down: rect[0].y + rect[0].h
        }
    }

    function eventMouseDown() {
        canvas.addEventListener('mousedown', function (e) {
            var x = e.offsetX;
            var y = e.offsetY;
            var clOrNot = false;

            for( var i = 0; i < circ.length; i++ ){
                // console.log(i + ":");
                // console.log("x - " + circ[i].x);
                // console.log("y - " + circ[i].y);
                // console.log("vx - " + circ[i].vx);
                // console.log("vy - " + circ[i].vy);
                if(Math.pow(x - circ[i].x, 2) + Math.pow(y - circ[i].y, 2) <= Math.pow(circ[i].r, 2)){
                    delCirc.push(circ[i]);
                    circ.splice(i, 1);
                    score += 100;
                    clOrNot = true;
                }
            }
            if (!clOrNot)
                hearts -= 1;
            if ((lvl > allLvls || hearts <= 0) && (x >= 557 && x <= 957 && y >= 328 && y <= 438)) {
                lvl = 1;
                score = 0;
                hearts = heartsAll;
                circ.splice(0, circ.length);
                createCircles(lvl);
            }
        });
    }

    function eventMouseMove() {
        canvas.addEventListener('mousemove', function (e) {
            var x = e.offsetX;
            var y = e.offsetY;
            moveOn = (lvl > allLvls || hearts <= 0) && (x >= 557 && x <= 957 && y >= 328 && y <= 438);
        });
    }

    function drawBackground() {
        ctx.save();
        ctx.fillStyle = rect[1].fillStyle;
        ctx.fillRect(rect[1].x, rect[1].y, rect[1].w, rect[1].h);
        ctx.lineWidth = rect[0].lineW;
        //ctx.fillStyle = rect[0].fillStyle;
        //ctx.fillRect(rect[0].x, rect[0].y, rect[0].w, rect[0].h);
        ctx.drawImage(bg, rect[0].x, rect[0].y, rect[0].w, rect[0].h);
        ctx.strokeStyle = rect[0].strokeStyle;
        ctx.strokeRect(rect[0].x, rect[0].y, rect[0].w, rect[0].h);
        ctx.restore();
    }
}