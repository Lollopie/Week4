function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // storage unavailable — ignore
    }
}

function loadVolume(key) {
    const stored = parseFloat(storageGet(key));
    return Number.isNaN(stored) ? 0.3 : stored;
}

const audioLevels = {
    backgroundMusicVolume: loadVolume('backgroundMusicVolume'),
    sfxSoundVolume: loadVolume('sfxSoundVolume'),
};

let isMuted = storageGet('isMuted') === 'true';

const musicAudioElement = document.querySelector('.background-music');
const sfxAudioElement = document.querySelector('.sfx');
const crashAudioElement = document.querySelector('.sfx-crash');

const pauseMusicVolumeNumber = document.querySelector('#pause-music-volume-number');
const pauseSfxVolumeNumber = document.querySelector('#pause-sfx-volume-number');

const pauseMusicSlider = document.querySelector('#pause-music-volume');
const pauseSfxSlider = document.querySelector('#pause-sfx-volume');

const settingsMusicVolumeNumber = document.querySelector('#settings-music-volume-number');
const settingsSfxVolumeNumber = document.querySelector('#settings-sfx-volume-number');

const settingsMusicSlider = document.querySelector('#settings-music-volume');
const settingsSfxSlider = document.querySelector('#settings-sfx-volume');

const activeColor = '#6D7D76';
const inactiveColor = '#2C363F';

function applyVolumes() {
    musicAudioElement.volume = isMuted ? 0 : audioLevels.backgroundMusicVolume;
    sfxAudioElement.volume = isMuted ? 0 : audioLevels.sfxSoundVolume;
    crashAudioElement.volume = isMuted ? 0 : audioLevels.sfxSoundVolume;
}

function setMusicVolume(value) {
    audioLevels.backgroundMusicVolume = value;
    storageSet('backgroundMusicVolume', value);
    applyVolumes();
    document.dispatchEvent(
        new CustomEvent('musicVolumeChanged', {
            detail: { volume: value },
        })
    );
}

function setSFXVolume(value) {
    audioLevels.sfxSoundVolume = value;
    applyVolumes();
    storageSet('sfxSoundVolume', value);
    document.dispatchEvent(
        new CustomEvent('sfxVolumeChanged', {
            detail: { volume: value },
        })
    );
}

function paintSlider(slider, percentage) {
    slider.value = percentage;
    slider.style.background =
        `linear-gradient(90deg, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
}

pauseMusicSlider.addEventListener('input', (e) => setMusicVolume(e.target.value / 100));
pauseSfxSlider.addEventListener('input', (e) => setSFXVolume(e.target.value / 100));
settingsMusicSlider.addEventListener('input', (e) => setMusicVolume(e.target.value / 100));
settingsSfxSlider.addEventListener('input', (e) => setSFXVolume(e.target.value / 100));

document.addEventListener('musicVolumeChanged', (e) => {
    const percentage = Math.round(e.detail.volume * 100);
    paintSlider(pauseMusicSlider, percentage);
    paintSlider(settingsMusicSlider, percentage);
    pauseMusicVolumeNumber.textContent = `${percentage}%`;
    settingsMusicVolumeNumber.textContent = `${percentage}%`;
});

document.addEventListener('sfxVolumeChanged', (e) => {
    const percentage = Math.round(e.detail.volume * 100);
    paintSlider(pauseSfxSlider, percentage);
    paintSlider(settingsSfxSlider, percentage);
    pauseSfxVolumeNumber.textContent = `${percentage}%`;
    settingsSfxVolumeNumber.textContent = `${percentage}%`;
});

const muteButtons = [...document.querySelectorAll('.main-menu-audio>.fa-solid, .game-audio>.fa-solid')];

function toggleMute() {
    isMuted = !isMuted;
    storageSet('isMuted', isMuted);
    muteButtons.forEach((button) => {
        button.classList.toggle('fa-volume-xmark', isMuted);
        button.classList.toggle('fa-volume-high', !isMuted);
    });
    applyVolumes();
}

muteButtons.forEach((button) => button.addEventListener('click', () => toggleMute()));

muteButtons.forEach((button) => {
    button.classList.toggle('fa-volume-xmark', isMuted);
    button.classList.toggle('fa-volume-high', !isMuted);
});

muteButtons.forEach((button) => button.addEventListener('click', () => toggleMute()));

const songOptions = [...document.querySelectorAll('.bg-music')];

function playBackgroundMusicTrack(track) {
    musicAudioElement.setAttribute('src', `public/music/${track}.mp3`);
    musicAudioElement.load();
    applyVolumes();
    musicAudioElement.play().catch(() => {});
    storageSet('backgroundMusicTrack', track);
    songOptions.forEach((option) => {
        const isSelected = option.dataset.track === track;
        option.classList.toggle('bg-music-active', isSelected);
        option.textContent = (isSelected ? '[x]' : '[ ]') + option.textContent.slice(3);
    });
}

songOptions.forEach((songOption) => {
    songOption.addEventListener('click', function () {
        const track = this.dataset.track;
        playBackgroundMusicTrack(track);
    });
});

setMusicVolume(audioLevels.backgroundMusicVolume);
setSFXVolume(audioLevels.sfxSoundVolume);
const defaultTrack = 'CAT_CHASE';
playBackgroundMusicTrack(storageGet('backgroundMusicTrack') || defaultTrack);