const EDO = require("edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}
const unique_in_array = (list) => {

    let unique  = new Set(list.map(JSON.stringify));
    unique = Array.from(unique).map(JSON.parse);

    return unique
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const make_melody = (pitches,wrong_note_pos,melody_length) =>{
    shift_dir = rand_int_in_range_but_not_zero(-1,1)
    let melody = edo.get.random_melody(melody_length,[0,12],4,pitches,5)
    melody[wrong_note_pos]+=shift_dir
    const melody_pitches = Array.from(new Set(melody.map(p=>p%12))).sort((a,b)=>a-b)
    if(melody_pitches.length==pitches.length) return make_melody(pitches,wrong_note_pos,melody_length)
    return {melody:melody,shift_dir:shift_dir}
}

const make_block = function (subject_id,sets=[[0,2,4,7,9],[0,1,2,3,5]],melody_length=16, wrong_note_pos=[10,14],Q_per_condition=1) {
    let All_Qs = []
    sets.forEach(set=>{
        set = edo.scale(set)
        const modes = set.pitches.map((p,i)=>set.mode(i)) // All modes in shuffled order
        modes.forEach(mode=>{
            wrong_note_pos.forEach(pos=>{
                for (let i = 0; i < Q_per_condition; i++) {
                    const melody = make_melody(mode.pitches,pos,melody_length)
                    const Q = {
                        set:set.pitches,
                        mode: mode.pitches,
                        melody: melody.melody,
                        shift_position_abs:pos, //13th note, 15th note, etc.
                        shift_position_rel: wrong_note_pos.indexOf(pos)+1, //1st position / 2nd position, etc.
                        shift_dir: melody.shift_dir,
                        POI: wrong_note_pos
                    }
                    All_Qs.push(Q)
                }
            })
        })
    })
    All_Qs = shuffle(All_Qs)
    const transpositions = shuffle(Array.from(Array(All_Qs.length).keys()).map(t=>(t%9)-4))
    All_Qs = All_Qs.map((Q,i)=>{
        Q.transposition = transpositions[i]
        Q.num_in_block = i+1
        Q.subject = subject_id
        return Q
    })
    return All_Qs
}

const make_stimuli = function (subject_id,num_of_blocks=10) {
    let all_blocks = []

    for (let i = 0; i < num_of_blocks; i++) {
        let block = make_block(subject_id)
        block = block.map((Q,num)=>{
            Q.block=i+1
            Q.num_in_task = (i*block.length)+Q.num_in_block
            return Q
        })
        all_blocks.push(block)
    }
    return all_blocks
}

module.exports = make_stimuli


