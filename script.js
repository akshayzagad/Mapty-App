'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(cords,distance,duration){
        // this.date = ...
        // this.id = ...
        this.cords = cords;
        this.distance = distance; // in km
        this.duration = duration;// in min
    }
}

class Running extends Workout {
    type = 'running';
    constructor(cords, distance, duration, cadence){
        super(cords, distance, duration);
        this.cadence = cadence ; 
        this.calcPace();
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
        this.cadence = elevation;
        this.calcSpeed();
    }

    calcSpeed() {
        // km/hr
        this.speed = this.distance / (this.duration/60);
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
    #mapEvent;
    #workOut= [];
    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField);
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

        this.#map = L.map('map').setView(cords, 13);

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

        this.renderWorkoutMarker(workout);

        /* Hide Input value when sumbmitted & Hide Form also */
        
        inputDistance.value = inputDuration.value = inputDistance.value = inputElevation.value = ''; 
       
    }

    renderWorkoutMarker(workout){
        console.log(this.#mapEvent);
        L.marker(workout.cords).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 150, minWidth: 150, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` }))
            .setPopupContent('workout')
            .openPopup();
    }

}


const app = new App();





