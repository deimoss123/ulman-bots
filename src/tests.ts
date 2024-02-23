const MIN_OGAS = 3;
const MAX_OGAS = 6;

function getRandomMaxOgas() {
    const rand = Math.floor(Math.random() * (MAX_OGAS - MIN_OGAS + 1)) + MIN_OGAS;
    return rand;
}
for (let i = 0; i < 10; i++) {
    const randomoga = getRandomMaxOgas()
    console.log(randomoga)
}
// const randomoga = getRandomMaxOgas()
// console.log(randomoga)
