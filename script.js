'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

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

const  run1 = new Running([39,-12],5.2,24,178);
const cycling1 = new Cycling([39, -12], 5.2, 24, 178);

console.log(run1,cycling1);
/* ------------------------------------------------------------------  */ 
class App {

    #map;
    #mapEvent;

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
        // Clear input field
        inputDistance.value = inputDuration.value = inputDistance.value = inputElevation.value = '';
        //Display Marker 
        e.preventDefault();
        console.log(this.#mapEvent);
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 150, minWidth: 150, autoClose: false, closeOnClick: false, className: 'running - popup' }))
            .setPopupContent('Workout')
            .openPopup();
    }

}


const app = new App();





