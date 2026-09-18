const audioLevels = {
    backgroundMusicVolume: 0.3,
    sfxMusicVolume: 0.3,
}

const musicAudioElement = document.querySelector('.background-music');
const sfxAudioElement = document.querySelector('.sfx');

const pauseMusicVolumeNumber = document.querySelector('#pause-music-volume-number');
const pauseSfxVolumeNumber = document.querySelector('#pause-sfx-volume-number');

const pauseMusicSlider = document.querySelector("#pause-music-volume");
const pauseSfxSlider = document.querySelector('#pause-sfx-volume');

const settingsMusicVolumeNumber = document.querySelector('#settings-music-volume-number');
const settingsSfxVolumeNumber = document.querySelector('#settings-sfx-volume-number');

const settingsMusicSlider = document.querySelector("#settings-music-volume");
const settingsSfxSlider = document.querySelector('#settings-sfx-volume');

function setMusicVolume(value) {
    audioLevels.backgroundMusicVolume = value;
    musicAudioElement.volume = value;
    document.dispatchEvent(
        new CustomEvent('musicVolumeChanged', { 
            detail: {
                volume: value,
            } 
        })
    );
}

function setSFXVolume(value) {
    audioLevels.sfxMusicVolume = value;
    sfxAudioElement.volume = value;
    document.dispatchEvent(
        new CustomEvent('sfxVolumeChanged', { 
            detail: {
                volume: value,
            } 
        })
    );
}

pauseMusicSlider.addEventListener('input', (e) => setMusicVolume(e.target.value / 100));
pauseSfxSlider.addEventListener('input', (e) => setSFXVolume(e.target.value / 100));
settingsMusicSlider.addEventListener('input', (e) => setMusicVolume(e.target.value / 100));
settingsSfxSlider.addEventListener('input', (e) => setSFXVolume(e.target.value / 100));

const activeColor = "#6D7D76";
const inactiveColor = "#2C363F";

document.addEventListener('musicVolumeChanged', (e) => {
    const percentage = Math.floor(e.detail.volume * 100);
    pauseMusicSlider.value = percentage;
    pauseMusicSlider.style.background = `linear-gradient(90deg, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
    pauseMusicVolumeNumber.textContent = `${percentage}%`;
    settingsMusicSlider.value = percentage;
    settingsMusicSlider.style.background = `linear-gradient(90deg, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
    settingsMusicVolumeNumber.textContent = `${percentage}%`;
});

document.addEventListener('sfxVolumeChanged', (e) => {
    const percentage = Math.floor(e.detail.volume * 100);
    pauseSfxSlider.value = percentage;
    pauseSfxSlider.style.background = `linear-gradient(90deg, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
    pauseSfxVolumeNumber.textContent = `${percentage}%`;
    settingsSfxSlider.value = percentage;
    settingsSfxSlider.style.background = `linear-gradient(90deg, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
    settingsSfxVolumeNumber.textContent = `${percentage}%`;
});

const mainMenuMuteButton = document.querySelector('.main-menu-audio>.fa-solid');
mainMenuMuteButton.addEventListener('click', function () {
    this.classList.toggle('fa-volume-xmark');
    this.classList.toggle('fa-volume-high');
    if (this.classList.contains('fa-volume-xmark')) {
        musicAudioElement.volume = 0;
        sfxAudioElement.volume = 0;
    } else {
        musicAudioElement.volume = audioLevels.backgroundMusicVolume;
        sfxAudioElement.volume = audioLevels.sfxMusicVolume;
    }
});

const songOptions = [...document.querySelectorAll('.bg-music')];
songOptions.forEach((songOption) => {
    songOption.addEventListener("click", function () {
        musicAudioElement.setAttribute('src', `public/music/${this.dataset.track}.mp3`);
        musicAudioElement.play().catch(() => {});
        const activeSongOptions = songOptions.filter((songOption) => songOption.textContent[1] === 'x');
        activeSongOptions.forEach((activeSongOption) => {
            activeSongOption.classList.remove('bg-music-active')
            activeSongOption.textContent = '[ ]' + activeSongOption.textContent.slice(3);
        });
        const selectedSongOptions = songOptions.filter((option) => option.textContent === songOption.textContent);
        selectedSongOptions.forEach((songOption) => {
            songOption.classList.add('bg-music-active');
            songOption.textContent = '[x]' + songOption.textContent.slice(3);
        });
    })
});