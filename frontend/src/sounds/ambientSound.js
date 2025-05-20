var droneSound;
var industrialSound;

export async function initAmbientSound(){
    await Tone.loaded().then(() => {
        Tone.start();
        droneSound = new Tone.Player("../assets/sounds/droneLoop.wav", () => {
            droneSound.loop = true;
            droneSound.volume.value = -15;
            droneSound.start().toDestination();

        })

            industrialSound = new Tone.Player("../assets/sounds/industrialDrone.mp3", () => {
            industrialSound.loop = true;
            industrialSound.volume.value = -30;
            industrialSound.start().toDestination();

        })
    });
}