function getToDoTasks(listaTareas){
    return listaTareas.filter(n => n.done === false || typeof(n.done) === 'undefined').map(n => n.text)
} 

function findByTag(tasks, tag){
    return tasks.filter(n => n.tags.every(e => e === tag ) && n.tags.length !==0)
}

function findByTags(tasks, tags){
    return tasks.filter(n => n.tags.some(e => tags.includes(e)) && n.tags.length !==0) 
}

function countDone(tasks){
    return (tasks.filter(n => n.done === true)).length
}

function createTask(texto){
    let regexp = /@\w+/g //@cualquier letra o numero. La g es para coger todos los tags que hay.
    let tags = texto.match(regexp)
    tags = tags.map(e => e.substring(1)) //le quitas el @ del principio
    texto = texto.replace(regexp, "").trim() //quitarle los tags al texto con replace "" y los espacios con trim

    return { texto, tags }
}
