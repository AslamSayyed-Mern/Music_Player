// Music Player JavaScript
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.originalPlaylist = [];
        this.isMuted = false;
        this.previousVolume = 0.7;
        
        // DOM Elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressHandle = document.getElementById('progressHandle');
        this.progressBarContainer = document.getElementById('progressBarContainer');
        this.volumeBar = document.getElementById('volumeBar');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeBarContainer = document.getElementById('volumeBarContainer');
        this.muteBtn = document.getElementById('muteBtn');
        this.muteIcon = document.getElementById('muteIcon');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.totalTimeSpan = document.getElementById('totalTime');
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.songAlbum = document.getElementById('songAlbum');
        this.albumArt = document.getElementById('albumArt');
        this.playlistContainer = document.getElementById('playlist');
        this.playlistCount = document.getElementById('playlistCount');
        
        this.initializePlayer();
        this.loadSamplePlaylist();
        this.setupEventListeners();
    }
    
    initializePlayer() {
        // Set initial volume
        this.audio.volume = 0.7;
        this.updateVolumeDisplay();
        
        // Set initial repeat mode
        this.updateRepeatButton();
        
        // Load the first track
        if (this.playlist.length > 0) {
            this.updateSongDetails();
        }
    }
    
    loadSamplePlaylist() {
        // Your actual MP3 files playlist with corresponding images
        this.playlist = [
            {
                title: "L's Theme",
                artist: "Death Note OST",
                album: "Death Note Original Soundtrack",
                src: "Audio/l_theme_death_note.mp3",
                albumArt: "Images/l_theme_image.jfif",
                duration: "0:00"
            },
            {
                title: "Naruto Theme",
                artist: "Naruto OST",
                album: "Naruto Original Soundtrack",
                src: "Audio/naruto.mp3",
                albumArt: "Images/naruto_image.jpg",
                duration: "0:00"
            },
            {
                title: "Senya",
                artist: "Itachi OST",
                album: "Touhou Music Collection",
                src: "Audio/senya.mp3",
                albumArt: "Images/Senya_itachi_theme_image.jpg",
                duration: "0:00"
            },
            {
                title: "Suzume",
                artist: "RADWIMPS",
                album: "Suzume Original Soundtrack",
                src: "Audio/suzume.mp3",
                albumArt: "Images/suzume_image.jfif",
                duration: "0:00"
            }
        ];
        
        this.originalPlaylist = [...this.playlist];
        this.renderPlaylist();
        this.updatePlaylistCount();
    }
    
    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Next/Previous buttons
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        
        // Shuffle button
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        // Repeat button
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        this.progressBarContainer.addEventListener('click', (e) => this.seekTo(e));
        this.progressBarContainer.addEventListener('mousemove', (e) => this.updateProgressHandle(e));
        this.progressBarContainer.addEventListener('mouseleave', () => this.hideProgressHandle());
        
        // Volume control
        this.volumeBarContainer.addEventListener('click', (e) => this.setVolume(e));
        this.volumeBarContainer.addEventListener('mousemove', (e) => this.updateVolumeHandle(e));
        this.volumeBarContainer.addEventListener('mouseleave', () => this.hideVolumeHandle());
        
        // Mute button
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // Play/Pause functionality
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (this.playlist.length === 0) return;
        
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (this.audio.src !== currentTrack.src) {
            this.audio.src = currentTrack.src;
            this.updateSongDetails();
        }
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
            this.albumArt.classList.add('playing');
        }).catch(error => {
            console.error('Error playing audio:', error);
            this.handleAudioError(error);
        });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.albumArt.classList.remove('playing');
    }
    
    // Track navigation
    nextTrack() {
        if (this.playlist.length === 0) return;
        
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
            return;
        }
        
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
    }
    
    previousTrack() {
        if (this.playlist.length === 0) return;
        
        this.currentTrackIndex = this.currentTrackIndex === 0 
            ? this.playlist.length - 1 
            : this.currentTrackIndex - 1;
        this.loadTrack(this.currentTrackIndex);
    }
    
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audio.src = track.src;
        this.updateSongDetails();
        this.updatePlaylistUI();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    // Shuffle functionality
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.updateShuffleButton();
        
        if (this.isShuffled) {
            this.shufflePlaylist();
        } else {
            this.restoreOriginalOrder();
        }
    }
    
    shufflePlaylist() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        const shuffled = [...this.playlist];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Keep current track at the beginning
        const currentIndex = shuffled.findIndex(track => track === currentTrack);
        if (currentIndex > 0) {
            [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
        }
        
        this.playlist = shuffled;
        this.currentTrackIndex = 0;
        this.renderPlaylist();
    }
    
    restoreOriginalOrder() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        this.playlist = [...this.originalPlaylist];
        this.currentTrackIndex = this.playlist.findIndex(track => track === currentTrack);
        this.renderPlaylist();
    }
    
    // Repeat functionality
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        this.updateRepeatButton();
    }
    
    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.playlist.length - 1) {
            this.nextTrack();
        } else {
            this.pause();
            this.audio.currentTime = 0;
        }
    }
    
    // Progress bar functionality
    seekTo(event) {
        const rect = this.progressBarContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.audio.duration;
        
        if (!isNaN(newTime) && isFinite(newTime)) {
            this.audio.currentTime = newTime;
        }
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const percentage = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.width = percentage + '%';
            this.progressHandle.style.left = percentage + '%';
            this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    updateProgressHandle(event) {
        const rect = this.progressBarContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
        this.progressHandle.style.left = percentage + '%';
    }
    
    hideProgressHandle() {
        // Handle will be hidden by CSS on mouse leave
    }
    
    // Volume control functionality
    setVolume(event) {
        const rect = this.volumeBarContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
        
        this.audio.volume = percentage / 100;
        this.previousVolume = this.audio.volume;
        
        // If volume is set above 0, unmute
        if (this.audio.volume > 0 && this.isMuted) {
            this.isMuted = false;
            this.muteIcon.className = 'fas fa-volume-up';
            this.muteBtn.classList.remove('muted');
            this.muteBtn.title = 'Mute';
        }
        
        this.updateVolumeDisplay();
    }
    
    updateVolumeDisplay() {
        const percentage = this.isMuted ? 0 : (this.audio.volume * 100);
        this.volumeBar.style.width = percentage + '%';
        this.volumeHandle.style.left = percentage + '%';
    }
    
    updateVolumeHandle(event) {
        const rect = this.volumeBarContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
        this.volumeHandle.style.left = percentage + '%';
    }
    
    hideVolumeHandle() {
        // Handle will be hidden by CSS on mouse leave
    }
    
    // Mute functionality
    toggleMute() {
        if (this.isMuted) {
            // Unmute
            this.audio.volume = this.previousVolume;
            this.isMuted = false;
            this.muteIcon.className = 'fas fa-volume-up';
            this.muteBtn.classList.remove('muted');
            this.muteBtn.title = 'Mute';
        } else {
            // Mute
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
            this.muteIcon.className = 'fas fa-volume-mute';
            this.muteBtn.classList.add('muted');
            this.muteBtn.title = 'Unmute';
        }
        this.updateVolumeDisplay();
    }
    
    // UI Updates
    updatePlayPauseButton() {
        if (this.isPlaying) {
            this.playPauseIcon.className = 'fas fa-pause';
            this.playPauseBtn.title = 'Pause';
        } else {
            this.playPauseIcon.className = 'fas fa-play';
            this.playPauseBtn.title = 'Play';
        }
    }
    
    updateShuffleButton() {
        if (this.isShuffled) {
            this.shuffleBtn.classList.add('active');
        } else {
            this.shuffleBtn.classList.remove('active');
        }
    }
    
    updateRepeatButton() {
        this.repeatBtn.classList.remove('active');
        
        switch (this.repeatMode) {
            case 'all':
                this.repeatBtn.classList.add('active');
                this.repeatBtn.title = 'Repeat All';
                break;
            case 'one':
                this.repeatBtn.classList.add('active');
                this.repeatBtn.title = 'Repeat One';
                break;
            default:
                this.repeatBtn.title = 'Repeat Off';
        }
    }
    
    updateSongDetails() {
        const track = this.playlist[this.currentTrackIndex];
        this.songTitle.textContent = track.title;
        this.songArtist.textContent = track.artist;
        this.songAlbum.textContent = track.album;
        this.albumArt.src = track.albumArt;
        this.albumArt.alt = `${track.title} - ${track.artist}`;
    }
    
    updateDuration() {
        this.totalTimeSpan.textContent = this.formatTime(this.audio.duration);
    }
    
    updatePlaylistUI() {
        const playlistItems = this.playlistContainer.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === this.currentTrackIndex) {
                item.classList.add('active');
            }
        });
    }
    
    renderPlaylist() {
        this.playlistContainer.innerHTML = '';
        
        this.playlist.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === this.currentTrackIndex ? 'active' : ''}`;
            playlistItem.innerHTML = `
                <div class="playlist-item-number">${index + 1}</div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${track.title}</div>
                    <div class="playlist-item-artist">${track.artist}</div>
                </div>
                <div class="playlist-item-duration">${track.duration}</div>
            `;
            
            playlistItem.addEventListener('click', () => {
                this.loadTrack(index);
                if (!this.isPlaying) {
                    this.play();
                }
            });
            
            this.playlistContainer.appendChild(playlistItem);
        });
    }
    
    updatePlaylistCount() {
        this.playlistCount.textContent = `${this.playlist.length} song${this.playlist.length !== 1 ? 's' : ''}`;
    }
    
    // Event handlers
    onPlay() {
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.albumArt.classList.add('playing');
    }
    
    onPause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.albumArt.classList.remove('playing');
    }
    
    handleAudioError(error) {
        console.error('Audio error:', error);
        this.pause();
        // You could show a user-friendly error message here
    }
    
    handleKeyboard(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!this.isMuted) {
                    this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                    this.previousVolume = this.audio.volume;
                    this.updateVolumeDisplay();
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (!this.isMuted) {
                    this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                    this.previousVolume = this.audio.volume;
                    this.updateVolumeDisplay();
                }
                break;
            case 'KeyM':
                event.preventDefault();
                this.toggleMute();
                break;
        }
    }
    
    // Utility functions
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Public methods for external use
    addTrack(track) {
        // Set default album art if not provided
        if (!track.albumArt) {
            track.albumArt = "https://via.placeholder.com/300x300/667eea/ffffff?text=New+Track";
        }
        
        this.playlist.push(track);
        this.originalPlaylist.push(track);
        this.renderPlaylist();
        this.updatePlaylistCount();
    }
    
    removeTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.playlist.splice(index, 1);
            this.originalPlaylist.splice(index, 1);
            
            if (this.currentTrackIndex >= this.playlist.length) {
                this.currentTrackIndex = Math.max(0, this.playlist.length - 1);
            }
            
            this.renderPlaylist();
            this.updatePlaylistCount();
        }
    }
    
    clearPlaylist() {
        this.playlist = [];
        this.originalPlaylist = [];
        this.currentTrackIndex = 0;
        this.pause();
        this.audio.src = '';
        this.renderPlaylist();
        this.updatePlaylistCount();
        this.songTitle.textContent = 'No songs in playlist';
        this.songArtist.textContent = 'Add some music to get started';
        this.songAlbum.textContent = '';
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});

// Add some additional utility functions
function addCustomTrack() {
    const title = prompt('Enter song title:');
    const artist = prompt('Enter artist name:');
    const album = prompt('Enter album name:');
    const src = prompt('Enter audio file URL:');
    const albumArt = prompt('Enter album art image path (optional):');
    
    if (title && artist && album && src) {
        const track = {
            title: title,
            artist: artist,
            album: album,
            src: src,
            albumArt: albumArt || `https://via.placeholder.com/300x300/667eea/ffffff?text=${encodeURIComponent(title)}`,
            duration: '0:00'
        };
        
        window.musicPlayer.addTrack(track);
    }
}

// Add keyboard shortcut info
document.addEventListener('DOMContentLoaded', () => {
    console.log('Music Player Keyboard Shortcuts:');
    console.log('Space - Play/Pause');
    console.log('Left Arrow - Previous Track');
    console.log('Right Arrow - Next Track');
    console.log('Up Arrow - Increase Volume');
    console.log('Down Arrow - Decrease Volume');
    console.log('M - Mute/Unmute');
});
