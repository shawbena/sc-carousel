(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(module.exports) : typeof define !== 'undefined' && define.amd ? define(factory(exports)) : factory(global);
}(this, (function (exports) {
    "use strict"
    exports.carousel_fun = carousel_fun;
    function carousel_fun(carousel) {
        if (!(carousel instanceof HTMLElement)) {
            throw TypeError('expect carousel typeof HTMLElement, but got ' + carousel);
        }
        var carouselInner = carousel.getElementsByClassName('sc-inner')[0]
        var carouselItems = carouselInner.getElementsByClassName('sc-item')
        var carouselIndicotor = carousel.getElementsByClassName('sc-indicators')[0]
        var slides = carouselItems.length;
        carouselIndicotor.appendChild(generateNIndictors(slides));

        carouselInner.style.transition = 'all ease 0.5s';
        carouselInner.style.transform = 'translateX(0px)';
        carouselInner.style.width = slides * 100 + '%';
        var width = carousel.scrollWidth;
        for (var i = 0; i < slides; i++) {
            carouselItems[i].style.width = carousel.clientWidth + 'px';
        }
        var leftBreakPoints = []
        var rightBreakPoints = [];
        for (var i = 1; i <= slides; i++) {
            leftBreakPoints.push({
                start: (i - 1) / slides * width,
                min: ((i - 1) / slides + (1 / (slides * 3))) * width,
                max: (i / slides) * width,
                end: (i / slides) * width
            })
        }
        for (var i = slides; i >= 1; i--) {
            rightBreakPoints.push({
                min: (i - 1) / slides * width,
                max: (i / slides - (1 / (slides * 3))) * width,
                end: i / slides * width
            });
        }

        var timeoutId;
        var timeoutId = setTimeout(function startSlide() {
            toNext();
        }, 5000)

        carouselInner.addEventListener('transitionend', function (e) {
            setIndicator();
        });
        var leftBtn = document.getElementById('left')
        var rightBtn = document.getElementById('right');
        leftBtn.addEventListener('click', function () {
            clearTimeout(timeoutId)
            toPrev(true);
        })
        rightBtn.addEventListener('click', function () {
            clearTimeout(timeoutId)
            toNext(true);
        })

        function toNext(lastFirst) {
            var translateX = getTranslateX(carouselInner);
            translateX -= width / slides;
            if (translateX < -width * ((slides - 1) / slides)) {
                // translateX += width / slides;
                if (lastFirst) {
                    translateX = 0;
                } else {
                    toPrev();
                    return;
                }
            }
            carouselInner.style.transform = 'translateX(' + translateX + 'px)';
            timeoutId = setTimeout(toNext, 5000)
        }

        function toPrev(firstLast) {
            var translateX = getTranslateX(carouselInner);
            translateX += width / slides;
            if (translateX > 0) {
                if (firstLast) {
                    translateX = -width * ((slides - 1) / slides)
                } else {
                    toNext();
                    return;
                }
            }
            carouselInner.style.transform = 'translateX(' + translateX + 'px)';
            timeoutId = setTimeout(toPrev, 5000)
        }
        var clientX;
        var lastTranslate;
        carouselInner.addEventListener('touchstart', function (e) {
            clearTimeout(timeoutId)
            var regResult = /-[0-9]+/.exec(carouselInner.style.transform);
            if (regResult && regResult[0]) {
                lastTranslate = parseInt(regResult[0])
            } else {
                lastTranslate = 0;
            }
            var touch = e.changedTouches[0]
            clientX = touch.clientX;
            carouselInner.style.transition = '';
        });
        carouselInner.addEventListener('touchmove', function (e) {
            var regResult = /-?[0-9]+/.exec(carouselInner.style.transform);
            var translate;
            if (regResult && regResult[0]) {
                translate = parseInt(regResult[0])
            } else {
                translate = 0;
            }
            var touch = e.changedTouches[0]
            translate += touch.clientX - clientX;
            clientX = touch.clientX;
            if (translate >= 0) {
                translate = 0;
            } else if (translate < -width * (slides - 1) / slides) {
                translate = -(slides - 1) / slides * width;
            }
            carouselInner.style.transform = 'translate(' + translate + 'px)'
        })
        carouselInner.addEventListener('touchend', function (e) {
            carouselInner.style.transition = 'transform 0.5s ease';
            var regResult = /-[0-9]+/.exec(carouselInner.style.transform);
            var translate;
            var direction;
            if (regResult && regResult[0]) {
                translate = parseInt(regResult[0])
            }
            if (isNaN(translate)) {
                return;
            }
            if (translate - lastTranslate <= 0) {
                direction = 'left'
            } else {
                direction = 'right'
            }
            translate = -translate;
            // 向左移动
            if (direction == 'left') {
                for (var i = 0; i < leftBreakPoints.length; i++) {
                    if (translate >= leftBreakPoints[i].start && translate <= leftBreakPoints[i].min) {
                        translate = leftBreakPoints[i].start;
                        break;
                    }
                    if (translate >= leftBreakPoints[i].min && translate < leftBreakPoints[i].max) {
                        // left = max;
                        // toNext();
                        translate = leftBreakPoints[i].max;
                        break;
                    }
                }
            } else {
                for (var i = 0; i < rightBreakPoints.length; i++) {
                    // 向右移动
                    if (translate <= rightBreakPoints[i].end && translate >= rightBreakPoints[i].max) {
                        translate = rightBreakPoints[i].start;
                        break;
                    }
                    if (translate >= rightBreakPoints[i].min && translate < rightBreakPoints[i].max) {
                        // left = max;
                        // toNext();
                        translate = rightBreakPoints[i].min;
                        break;
                    }
                }
            }
            carouselInner.style.transform = 'translate(' + -translate + 'px)';
            setIndicator();
            if (direction == 'left') {
                timeoutId = setTimeout(toNext, 5000);
            } else {
                timeoutId = setTimeout(toPrev, 5000);
            }
        })
        carouselInner.addEventListener('touchcancel', function (e) {
            // console.log('touchcancel', e)
        })
        carouselInner.addEventListener('touchenter', function (e) {
            // console.log('touchenter', e)
        })
        carouselInner.addEventListener('touchleave', function (e) {
            // console.log('touchleave', e)
        })

        /*
         * 设置激活的指示器。
         * n: 指示器索引，从0开始。
         */
        function setIndicator() {
            var translateX = -getTranslateX(carouselInner);
            translateX += 10; // 偏移
            var n = 0;
            for (; n < leftBreakPoints.length; n++) {
                if (translateX > leftBreakPoints[n].start && translateX < leftBreakPoints[n].end) {
                    break;
                }
            }
            var indicators = carouselIndicotor.getElementsByTagName('li');
            for (var i = 0; i < indicators.length; i++) {
                indicators[i].classList.remove('active')
            }
            indicators[n].classList.add('active');
        }

        function slideTo(n) {
            clearTimeout(timeoutId);
            var direction;
            var prevTranslateX = getTranslateX(carouselInner);
            var translateX = -(n / slides) * width;
            if (translateX - prevTranslateX >= 0) {
                direction = 'right'
            } else {
                direction = 'left'
            }
            carouselInner.style.transform = 'translateX(' + translateX + 'px)';
            timeoutId = setTimeout(direction == 'left' ? toNext : toPrev, 5000)
        }
        /*
         * @return number
         */
        function getTranslateX(node) {
            if (!(node instanceof HTMLElement)) {
                throw TypeError('node type incorrect, expect HTMLElement, but get ' + node);
            }
            var regResult = /-?[0-9]+/.exec(node.style.transform);
            return regResult ? parseInt(regResult[0]) : 0;
        }
        /*
         * 生成指示器。
         */
        function generateNIndictors(n, active) {
            active = active || 0;
            var indicators = document.createDocumentFragment();
            for (var i = 0; i < n; i++) {
                var indicator = document.createElement('li');
                if (active == i) {
                    indicator.className = 'active';
                }
                // <li data-target="#carouselExampleCaptions" data-slide-to="1"></li>
                indicator.setAttribute('data-slide-to', i);
                indicator.addEventListener('click', (function (i) {
                    return function () {
                        slideTo(i)
                    }
                })(i))
                indicators.appendChild(indicator)
            }
            return indicators
        }
    }
})));