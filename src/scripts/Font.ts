import * as THREE from "three"

const a = [
    [" ", "X", " "],
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"]
]
const b = [
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", "X", " "]
]
const c = [
    [" ", "X", " "],
    ["X", " ", "X"],
    ["X", " ", " "],
    ["X", " ", "X"],
    [" ", "X", " "]
]
const d = [
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", " "]
]
const e = [
    ["X", "X", "X"],
    ["X", " ", " "],
    ["X", "X", " "],
    ["X", " ", " "],
    ["X", "X", "X"]
]
const f = [
    ["X", "X", "X"],
    ["X", " ", " "],
    ["X", "X", " "],
    ["X", " ", " "],
    ["X", " ", " "]
]
const g = [
    [" ", "X", " "],
    ["X", " ", "X"],
    ["X", " ", " "],
    ["X", " ", "X"],
    [" ", "X", " "]
]
const h = [
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"]
]
const i = [
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "]
]
const j = [
    ["X", "X", "X"],
    [" ", "X", " "],
    [" ", "X", " "],
    ["X", "X", " "],
    ["X", " ", " "]
]
const k = [
    ["X", " ", "X"],
    ["X", "X", " "],
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", " ", "X"]
]
const l = [
    ["X", " ", " "],
    ["X", " ", " "],
    ["X", " ", " "],
    ["X", " ", " "],
    ["X", "X", "X"]
]
const m = [
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"]
]
const n = [
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", "X", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"]
]
const o = [
    [" ", "X", " "],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"],
    [" ", "X", " "]
]
const p = [
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", "X", " "],
    ["X", " ", " "],
    ["X", " ", " "]
]
const qq = [
    [" ", "X", " "],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    [" ", "X", "X"]
]
const r = [
    ["X", "X", " "],
    ["X", " ", "X"],
    ["X", "X", " "],
    ["X", "X", " "],
    ["X", " ", "X"]
]
const s = [
    [" ", "X", "X"],
    ["X", " ", " "],
    [" ", "X", " "],
    [" ", " ", "X"],
    ["X", "X", " "]
]
const t = [
    ["X", "X", "X"],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "]
]
const u = [
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"],
    [" ", "X", " "]
]
const v = [
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    [" ", "X", " "]
]
const w = [
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"]
]
const x = [
    ["X", " ", "X"],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    ["X", " ", "X"]
]
const y = [
    ["X", " ", "X"],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "]
]
const z = [
    ["X", "X", "X"],
    [" ", " ", "X"],
    [" ", "X", " "],
    ["X", " ", " "],
    ["X", "X", "X"]
]
const space = [
    [" "],
    [" "],
    [" "],
    [" "],
    [" "]
]

const zero = [
    ["X", "X", "X",],
    ["X", " ", "X",],
    ["X", " ", "X",],
    ["X", " ", "X",],
    ["X", "X", "X",]
]

const one = [
    [" ", "X", " "],
    ["X", "X", " "],
    [" ", "X", " "],
    [" ", "X", " "],
    ["X", "X", "X"]

]

const two = [
    ["X", "X", "X"],
    [" ", " ", "X"],
    ["X", "X", "X"],
    ["X", " ", " "],
    ["X", "X", "X"]
]

const three = [
    ["X", "X", "X"],
    [" ", " ", "X"],
    ["X", "X", "X"],
    [" ", " ", "X"],
    ["X", "X", "X"]
]

const four = [
    ["X", " ", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    [" ", " ", "X"],
    [" ", " ", "X"]
]

const five = [
    ["X", "X", "X"],
    ["X", " ", " "],
    ["X", "X", "X"],
    [" ", " ", "X"],
    ["X", "X", "X"]
]

const six = [
    ["X", "X", "X"],
    ["X", " ", " "],
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"]
]

const seven = [
    ["X", "X", "X"],
    [" ", " ", "X"],
    [" ", " ", "X"],
    [" ", " ", "X"],
    [" ", " ", "X"]
]

const eight = [
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"]
]

const nine = [
    ["X", "X", "X"],
    ["X", " ", "X"],
    ["X", "X", "X"],
    [" ", " ", "X"],
    ["X", "X", "X"]
]

const numbers = [zero, one, two, three, four, five, six, seven, eight, nine]

const alphabet = {
    "a": a,
    "b": b,
    "c": c,
    "d": d,
    "e": e,
    "f": f,
    "g": g,
    "h": h,
    "i": i,
    "j": j,
    "k": k,
    "l": l,
    "m": m,
    "n": n,
    "o": o,
    "p": p,
    "q": qq,
    "r": r,
    "s": s,
    "t": t,
    "u": u,
    "v": v,
    "w": w,
    "x": x,
    "y": y,
    "z": z,
    " ": space
}

export const composeText = (text: string) => {
    text = text.replace(/\s/g, "");
    let _text: string[][] = []
    const h = 5;
    // loop for each row
    for (let i = 0; i < h; i++) {
        _text.push([])
        // loop for each letter
        for (let j = 0; j < text.length; j++) {
            // check if the letter is in the alphabet or is the number
            const l = text[j]
            if (alphabet[text[j] as keyof typeof alphabet]) {
                const letter = l as keyof typeof alphabet
                const letter_array = alphabet[letter][i]
                _text[i].push(...letter_array)
            } else if (numbers[parseInt(l)]) {
                const letter: number = parseInt(l)
                const letter_array = numbers[letter][i]
                _text[i].push(...letter_array)
            }
        }
    }
    return _text
}

function createBoxWithRoundedEdges(width: number, height: number, depth: number, radius0: number, smoothness: number) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new THREE.ExtrudeGeometry(shape, {
        // amount: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
}

function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export const composeGroup = (text: string, colors: string[], minY: number = 100, maxY: number = 1_000, linearColor: boolean = true, singleColor: boolean = false) => {
    const h: number = 5;
    const group = new THREE.Group()
    const _text: string[][] = composeText(text)
    const _singleColor = colors[Math.round(getRandomArbitrary(0, colors.length - 1))]
    
    // const paddingBetweenCube = 1.1
    
    const spaceIndex = text.indexOf(' ')

    _text.forEach((row, i) => {
        let cumulator = 0;
        row.forEach((col, j) => {
            // space between letters
            if (j % 3 === 0) { cumulator += 0.5 }
            // space
            if (j === spaceIndex * 3) { cumulator += 1.5 }

            if (col === 'X') {
                const cubeGeometry = createBoxWithRoundedEdges(1, 1, 1, 0.1, 10)
                const randomColor = colors[Math.round(getRandomArbitrary(0, colors.length - 1))]
                const _linearColor = colors[i >= colors.length ? 0 : i]
                const cubeMaterial = new THREE.MeshStandardMaterial({
                    color: linearColor ? _linearColor : singleColor ? _singleColor : randomColor,
                })

                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
                // TODO: center the text
                let centered = 0
                if(text.length <= 3) { centered = - 0.5 }
                else if (text.length <= 5) { centered = - 1 } 
                else if (text.length <= 7) { centered = - 1.5 } 
                else if (text.length <= 9) { centered = - 2 } 
                else if (text.length <= 11) { centered = - 2.5 } 
                else { centered = - 3 }
                
                cube.position.x = j + cumulator - _text[0].length / 2 + centered
                cube.position.z = i - h / 2 + 0.5
                cube.position.y = getRandomArbitrary(minY, maxY)
                group.add(cube)
            }
        })
    })

    return group
}