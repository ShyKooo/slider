function createsliders(arrSliders = false) {
    //Можно передать произвольный массив или 1 элемент, но обернуть в массив
    let slidersWrap = arrSliders || document.getElementsByClassName('slider__wrap');

    for (let i = 0; i < slidersWrap.length; i++) {
        let sliders = slidersWrap[i].getElementsByClassName('slider__slides')[0];
        let slides = slidersWrap[i].getElementsByClassName('slider__slide');
        let currentIndex = 1;
        let isAnimating = false;
        let arrows = slidersWrap[i].getElementsByClassName('slider__arrow');
        let transition = 'transform 0.3s';

        //Если меньше 2 слайдов - не создаем слайдер и удаляем стрелки
        if (slides.length < 2) {
            if (arrows[0])
                arrows[0].parentNode.remove();
            continue;
        }

        function moveSlide(step = 0) {
            if (step !== 0 && isAnimating)
                return;
            if (step !== 0)
                isAnimating = true;
            currentIndex += step;
            sliders.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
        }

        //Клоны для вечного скролла
        let firstClone = slides[0].cloneNode(true);
        let lastClone = slides[slides.length - 1].cloneNode(true);

        firstClone.classList.add('slider__slides_clone');
        lastClone.classList.add('slider__slides_clone');

        sliders.insertBefore(lastClone, slides[0]);
        sliders.appendChild(firstClone);

        moveSlide(0);
        sliders.style.transition = transition;

        //Настройки слайдеров, передавать в data .slider__wrap
        let swipe = slidersWrap[i].dataset.swipe ?? false;

        //Обработчик для стрелок, 0 - стрелка "назад", 1 - стрелка "вперед"
        for (let arr = 0; arr < 2; arr++) {
            arrows[arr].addEventListener('click', () => {
                moveSlide(arr ? 1 : -1);
            });
        }
        sliders.addEventListener('transitionend', () => {
            if (currentIndex === 0) {
                sliders.style.transition = 'none';
                currentIndex = slides.length - 2;
                moveSlide(0);
                void sliders.offsetWidth;
                sliders.style.transition = transition;
            } else if (currentIndex === slides.length - 1) {
                sliders.style.transition = 'none';
                currentIndex = 1;
                moveSlide(0);
                void sliders.offsetWidth;
                sliders.style.transition = transition;
            }
            isAnimating = false;
        });

        //Функционал свайпа
        if (swipe) {
            let startX = 0, startY = 0, deltaX = 0, deltaY = 0, isDragging = false;
            slidersWrap[i].addEventListener('pointerdown', (e) => {
                if (isAnimating || e.target.closest('.slider__arrow'))
                    return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                sliders.style.transition = 'none';
                slidersWrap[i].setPointerCapture(e.pointerId);
            });
            slidersWrap[i].addEventListener('pointermove', (e) => {
                if (!isDragging)
                    return;
                deltaX = e.clientX - startX;
                sliders.style.transform = 'translateX(calc(-' + currentIndex * 100 + '% + ' + deltaX + 'px))';
            });
            slidersWrap[i].addEventListener('pointerup', (e) => {
                if (!isDragging)
                    return;
                isDragging = false;
                sliders.style.transition = transition;
                deltaX = e.clientX - startX;
                deltaY = e.clientY - startY;

                if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY))
                    moveSlide(0);
                else
                    moveSlide(deltaX > 0 ? -1 : 1);
            });
            slidersWrap[i].addEventListener('pointercancel', () => {
                if (!isDragging)
                    return;
                isDragging = false;
                sliders.style.transition = transition;
                moveSlide(0);
            });
        }
    }
}