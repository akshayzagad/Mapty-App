'use strict';

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(cords, distance, duration) {
        // this.date = ...
        // this.id = ...
        this.cords = cords;
        this.distance = distance; // in km
        this.duration = duration;// in min
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on  ${months[this.date.getMonth()]
            } ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(cords, distance, duration, elevation) {
        super(cords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/hr
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

/*  const  run1 = new Running([39,-12],5.2,24,178);
const cycling1 = new Cycling([39, -12], 5.2, 24, 178);
console.log(run1,cycling1);*/

/* -------------------------------------------------------------------------------------------------------------------------------------  */

// Application Architecher

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {

    #map;
    #mapZoomLevel= 13;
    #mapEvent;
    #workOut = [];
    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField);

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not get your position')
                });
        };
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        const cords = [latitude, longitude];

        this.#map = L.map('map').setView(cords, this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputDistance.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _toggleElevationField() {
        console.log("hi");
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        const vallidInput = (...inputs) => inputs.every(ins => Number.isFinite(ins));
        const positiveNumber = (...inputs) => inputs.every(ins => ins > 0);

        /* Get data form Forms Input */

        const Type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        /* If Workout running , create running object */

        if (Type === 'running') {
            const cadence = +inputCadence.value;
            if (
                !vallidInput(distance, duration, cadence) || !positiveNumber(distance, duration, cadence)
            ) {
                return alert("Number is not Vallid");
            }

            workout = new Running([lat, lng], distance, duration, cadence);

        }

        /* If Workout cycling , create cycling object */

        if (Type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
                // !Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevation)
                !vallidInput(distance, duration, elevation) || !positiveNumber(distance, duration, elevation)
            ) {
                return alert("Number is not Vallid");
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        /* Add New Workout object to Array */

        this.#workOut.push(workout);

        /* Render workout on map as Form Submitted */

        this._renderWorkoutMarker(workout);

        /* Render Workout List */

        this._renderWorkout(workout);

        /* Hide Input value when sumbmitted & Hide Form also */

        this._hideForm();

    }

    _renderWorkoutMarker(workout) {
        console.log(this.#mapEvent);
        L.marker(workout.cords).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 150, minWidth: 180, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
                } ${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        console.log(workout.type)
        let html = `
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if (workout.type === 'running')
            html += `
             <div class="workout__details">
               <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.pace.toFixed(1)}</span>
               <span class="workout__unit">min/km</span>
             </div>
             <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
        </li >
            `;


        if (workout.type === 'cycling')
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(0)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevation}</span>
                    <span class="workout__unit">m</span>
                </div>
         </li> 
                `;


        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {

        const workoutEl = e.target.closest('.workout');

        const workout = this.#workOut.find(work => work.id === workoutEl.dataset.id);
        console.log(`${workoutEl.dataset.id} is dataset`);
        
        // console.log(workout.id);
        this.#map.setView(workout.cords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

}


const app = new App();





